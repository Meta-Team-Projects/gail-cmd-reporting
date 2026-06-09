import jsPDF from 'jspdf'

const cleanText = (text) => String(text || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Strip markdown link syntax but keep text
    .replace(/&emsp;|&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[¹₹]/g, 'Rs. ')                 // Ensure currency renders cleanly without corrupting kerning
    .replace(/[*_`>#~]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()

const cleanContainerText = (text) => String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&emsp;|&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

const formatSources = (sources) => {
    if (!Array.isArray(sources) || !sources.length) return ''

    const sourceLines = sources
        .map(source => {
            const fileName = source?.source_file || source?.file || source?.filename || source?.document_name
            if (!fileName) return ''

            return source?.page
                ? `• File: ${fileName} (Page: ${source.page})`
                : `• File: ${fileName}`
        })
        .filter(Boolean)

    return sourceLines.length
        ? `\n\nSources:\n${sourceLines.join('\n')}`
        : ''
}

const sanitizeFilename = (value) => String(value || 'saved-note')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
    .replace(/-+$/g, '')
    || 'saved-note'

export const downloadAnswerAsPdf = ({
    response,
    sources = [],
    title = 'Saved Note',
    filename = 'saved-note.pdf',
}) => {
    const rawNoteText = typeof response === 'string' ? response : response?.answer || response?.content || ''
    const contentText = cleanContainerText(rawNoteText) + formatSources(sources)

    if (!contentText.trim()) {
        alert('No note content found to download.')
        return
    }

    const pdf = new jsPDF()
    const margin = 15
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const maxLineWidth = pageWidth - margin * 2
    let y = margin

    const ensureSpace = (lineHeight = 6) => {
        if (y > pageHeight - margin - lineHeight) {
            pdf.addPage()
            y = margin
        }
    }

    const addWrappedText = ({
        text,
        x = margin,
        fontSize = 11,
        fontStyle = 'normal',
        lineHeight = 6,
        width = maxLineWidth,
        after = 2,
    }) => {
        const clean = cleanText(text)
        if (!clean) {
            y += after
            return
        }

        pdf.setFont('helvetica', fontStyle)
        pdf.setFontSize(fontSize)
        
        const lines = pdf.splitTextToSize(clean, width)
        lines.forEach(line => {
            ensureSpace(lineHeight)
            pdf.text(line, x, y, { charSpace: 0 }) // Prevent word-stretching spacing artifacts
            y += lineHeight
        })
        y += after
    }

    // Render Note Title Header
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    const titleLines = pdf.splitTextToSize(cleanText(title), maxLineWidth)
    titleLines.forEach(line => {
        ensureSpace(7)
        pdf.text(line, margin, y, { charSpace: 0 })
        y += 7
    })

    y += 4

    // Parse Paragraph Body Lines
    contentText.split('\n').forEach(rawLine => {
        const line = rawLine.trim()

        if (!line) {
            y += 4
            return
        }

        // Filter lines containing empty tables structural markups
        if (/^\|?[\s:-|]+\|[\s:-|]*$/.test(line)) return

        // Render Markdown Tables Robustly
        if (/^\|.*\|$/.test(line)) {
            const cells = line
                .split('|')
                .map(cell => cleanText(cell))
                .filter(Boolean)
            addWrappedText({
                text: cells.join('   |   '),
                fontSize: 10,
                width: maxLineWidth,
                after: 1,
            })
            return
        }

        // Render Headings
        const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)
        if (headingMatch) {
            const level = headingMatch[1].length
            addWrappedText({
                text: headingMatch[2],
                fontSize: level === 1 ? 14 : level === 2 ? 12 : 11,
                fontStyle: 'bold',
                lineHeight: level === 1 ? 7 : 6,
                after: 3,
            })
            return
        }

        // Render Bullet Points Cleanly
        const bulletMatch = line.match(/^[-*•]\s+(.+)$/)
        if (bulletMatch) {
            addWrappedText({
                text: `• ${bulletMatch[1]}`,
                x: margin + 4,
                width: maxLineWidth - 4,
                after: 1,
            })
            return
        }

        // Render Numbered Lists
        const numberedMatch = line.match(/^(\d+)[.)]\s+(.+)$/)
        if (numberedMatch) {
            addWrappedText({
                text: `${numberedMatch[1]}. ${numberedMatch[2]}`,
                x: margin + 4,
                width: maxLineWidth - 4,
                after: 1,
            })
            return
        }

        // Standard Text Paragraph Base
        addWrappedText({
            text: line,
            after: 3,
        })
    })

    const safeFilename = filename.toLowerCase().endsWith('.pdf')
        ? `${sanitizeFilename(filename.slice(0, -4))}.pdf`
        : `${sanitizeFilename(filename)}.pdf`

    pdf.save(safeFilename)
}