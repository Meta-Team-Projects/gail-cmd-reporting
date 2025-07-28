import React from 'react';

export default function LoadingScreen() {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#000000',
            zIndex: 1000,
        }}>
            <div style={{
                color: '#ffffff',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '24px',
                    marginBottom: '20px'
                }}>
                    Loading...
                </div>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '5px solid #333',
                    borderTop: '5px solid #ffffff',
                    borderRadius: '50%',
                    margin: '0 auto',
                    animation: 'spin 1s linear infinite',
                }}>
                </div>
                <style>
                    {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
                </style>
            </div>
        </div>
    );
}
