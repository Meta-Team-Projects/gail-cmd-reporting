import React, { useState, useRef, useEffect } from 'react'
import { Box, Typography, Button, IconButton, TextField, Tooltip } from '@mui/material'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import EditIcon from '@mui/icons-material/Edit'
import CancelIcon from '@mui/icons-material/Cancel'
import AspectRatioIcon from '@mui/icons-material/AspectRatio'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import Draggable from 'react-draggable'
import MarkdownIt from 'markdown-it'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

const Text = ({
  onSave, onClose, initialTitle = '',
  initialContent = '', placeholder = '', defaultEditing = false}) => {
  const [title, setTitle] = useState(initialTitle)
  const [text, setText] = useState(initialContent)
  const [fontSize, setFontSize] = useState(16)
  const [isMaximized, setIsMaximized] = useState(false)
  const [isEditing, setIsEditing] = useState(defaultEditing)
  const [boldActive, setBoldActive] = useState(false);
  const [italicActive, setItalicActive] = useState(false);

  const nodeRef = useRef(null)
  const editorRef = useRef(null)
  const mdParser = useRef(new MarkdownIt())

 useEffect(() => {
    const handleSelectionChange = () => {
      const bold = document.queryCommandState('bold')
      const italic = document.queryCommandState('italic')
      setBoldActive(bold)
      setItalicActive(italic)
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [])

  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.innerHTML = text;
      editorRef.current.focus();
      const range = document.createRange()
      range.selectNodeContents(editorRef.current)
      range.collapse(false)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }, [isEditing])

  const handlePaste = (e) => {
    e.preventDefault()
  const clipboardText = e.clipboardData.getData('text/plain')
  const html = mdParser.current.render(clipboardText)
  document.execCommand('insertHTML', false, html)
  }

  // const handleBold = () => {
  //   document.execCommand('bold', false, null)
  // }

  // const handleItalic = () => {
  //   document.execCommand('italic', false, null)
  // }

  const handleFontSizeChange = (px) => {
    const sizeMap = { 10: 1, 13: 2, 16: 3, 18: 4, 24: 5, 32: 6, 48: 7 }
    const closest = Object.keys(sizeMap).reduce((a, b) =>
      Math.abs(b - px) < Math.abs(a - px) ? b : a
    )
    document.execCommand('fontSize', false, sizeMap[closest])
    setFontSize(px)
  }

  const handleSave = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setText(content);
      if (onSave) {
        onSave({
          title: title || 'Untitled Note',
          content: content
        });
      }
    }
    if (onClose) onClose(); //to close notepad after saving
  }

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle" defaultPosition={{ x: 100, y: 100 }}>
      <Box
        ref={nodeRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: isMaximized ? '70vw' : '90%',
          maxWidth: isMaximized ? 'none' : 700,
          height: isMaximized ? '80vh' : '50vh',
          position: 'fixed',
          left: isMaximized ? '10vw' : '100px',
          top: isMaximized ? '20vh' : '100px',
          bgcolor: 'rgba(200, 223, 250, 0.6)',
          borderRadius: 2,
          boxShadow: 6,
          p: 2,
          fontFamily: 'Segoe UI, sans-serif',
          zIndex: 2000,
          cursor: 'default',
          overflow: 'hidden',
        }}
      >
        {!isEditing ? ( 
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0  }}>
            <Box
              className="drag-handle"
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'white',
                borderRadius: 2,
                px: 2,
                py: 1,
                cursor: 'move',
              }}
            >
              <Typography sx={{ fontWeight: 'bold', fontSize: '1.0417vw' }}>
                {title || 'GAIL Notepad'}
              </Typography>
              {/* <IconButton onClick={() => setIsEditing(true)} sx={{ ml: 'auto' }}>
                <EditIcon sx={{ color: 'black' }} />
              </IconButton> */}
              <IconButton sx={{ml: 'auto'}}
              onClick={onClose}>
                <CancelIcon sx={{ color: 'black', fontSize: '1.145vw' }} />
              </IconButton>
            </Box>
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                mt: 2,
                p: 2,
                border: '1px solid #ccc',
                flex: 1,
                overflowY: 'scroll !important', 
                whiteSpace: 'pre-wrap',
              }}
              >
               <div dangerouslySetInnerHTML={{ __html: text }} />
            </Box>
            <Button
              onClick={() => setIsEditing(true)}
              sx={{
                mt: 2,
                backgroundColor: '#006eff',
                color: 'white',
                fontSize: '0.7292vw',
                borderRadius: 1,
                px: 3,
                py: 1,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#0051c4' },
              }}
            >
              Edit
            </Button>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0  }}>
            <Box
              className="drag-handle"
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'white',
                borderRadius: 2,
                px: 2,
                py: 1,
                cursor: 'move',
              }}
            >
              {/* Note Heading */}
              <TextField
                variant="standard"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                inputProps={{
                  style: {
                    fontSize: '1.0417vw',
                    fontWeight: 'bold',
                    padding: 0,
                  },
                }}
                sx={{ width: 200 }}
              />
              {/* <IconButton sx={{ ml: 'auto', mr: 1 }} disabled>
                <EditIcon sx={{ color: 'gray' }} />
              </IconButton> */}
              <IconButton sx={{ml: 'auto'}}
              onClick={() => setIsMaximized(m => !m)}>
                {isMaximized
                  ? 
                  <Tooltip title="Collapse" placement='left' arrow> 
                  <CloseFullscreenIcon sx={{ color: 'black', fontSize: '1.145vw' }} />
                  </Tooltip>
                  : 
                  <Tooltip title="Expand" placement='left' arrow>
                  <AspectRatioIcon sx={{ color: 'black', fontSize: '1.145vw' }} />
                  </Tooltip>
                }
              </IconButton>
            </Box>

            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                mt: 2,
                p: 2,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                overflow: 'hidden',
                minHeight: 0,
              }}
            >
              
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(0,0,0,0.23)',
                  borderBottom: '1px solid rgba(0,0,0,0.23)',
                  py: 0.5,
                }}
              >
                <IconButton 
                size="small" 
                onClick={() => document.execCommand('bold')} 
                sx={{ //borderRight: '0.5px solid rgba(0,0,0,0.23)', 
                      borderRadius: 4,
                      background: boldActive ? 'rgba(177, 197, 221, 0.6)' : 'transparent',
                      mx: 0.5,
                      px: 0.5
                       }}>
                  <FormatBoldIcon sx={{ color: 'black', fontSize: '1.145vw' }} />
                </IconButton>
                <Typography sx={{pb: '0.2083vw',fontSize: '1.4583vw'}}> | </Typography>
                <IconButton 
                size="small" 
                onClick={() => document.execCommand('italic')} 
                sx={{ //borderRight: '0.5px solid rgba(0,0,0,0.23)', 
                      borderRadius: 4,
                      background: italicActive ? 'rgba(177, 197, 221, 0.6)' : 'transparent',
                      mx: 0.5,
                      px: 0.5
                        }}>
                  <FormatItalicIcon sx={{ color: 'black', fontSize: '1.145vw' }} />
                </IconButton>
                <Typography sx={{pb: '0.2083vw',fontSize: '1.4583vw'}}> | </Typography>
                <TextField
                  type="number"
                  value={fontSize}
                  onChange={e => handleFontSizeChange(Number(e.target.value))}
                  inputProps={{ min: 8, max: 48 }}
                  //size="small"
                  sx={{width: '3.6458vw', mx: 0.5,
                    '& .MuiInputBase-input': {
                      fontSize: '0.8333vw'
                    }
                  }}
                />
                <IconButton onClick={() => setIsEditing(false)} sx={{ ml: 'auto' }}>
                  <CancelIcon sx={{ color: 'black', fontSize: '1.145vw' }} />
                </IconButton>
              </Box>
              
              <Box
                contentEditable
                onPaste={handlePaste}
                suppressContentEditableWarning
                ref={editorRef}
                sx={{
                  width: '100%',
                  fontSize: '0.8333vw',
                  boxSizing: 'border-box',
                  border: '1px solid rgba(0,0,0,0.23)',
                  borderRadius: '4px',
                  p: 1,
                  fontFamily: 'Segoe UI, sans-serif',
                  outline: 'none',
                  whiteSpace: 'pre-wrap',
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto !important',
               // custom scrollbar
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#0088d7',
                    borderRadius: '3px',
                  },
                  /* Firefox */
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#0088d7 transparent',
                  overflowWrap: 'break-word',
                  bgcolor: 'white',
                  cursor: 'text',
                  '&:empty::before': {
                    content: `"${placeholder}"`,
                    color: '#888',
                    pointerEvents: 'none',
                    fontStyle: 'italic',
                  },                    
                }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {text}
                </ReactMarkdown>
                </Box>

              <Button
                onClick={handleSave}
                sx={{
                  backgroundColor: 'rgba(10,95,207,0.77)',
                  color: 'white',
                  borderRadius: 2,
                  width: '5vw',
                  fontSize: '0.7292vw',
                  mx: 'auto',
                  mt: 1,
                  py: 1,
                  '&:hover': { backgroundColor: 'rgba(10,95,207,1)' },
                }}
              >
                Save
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Draggable>
  )
}

export default Text
