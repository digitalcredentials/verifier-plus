import type { CopyButtonProps, CopyToClipboardProps } from './CopyToClipboard.d';


import { IconButton, Button, Snackbar } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from 'react'

const CopyButton = ({buttonText, handleClick} : CopyButtonProps) => {
  return buttonText?
  <Button onClick={handleClick} style={{fontSize:'.7em', fontWeight:'bold'}} color="inherit" size="small" variant="outlined" endIcon={<ContentCopyIcon />} > {buttonText} </Button>
  :
    <IconButton onClick={handleClick}><ContentCopyIcon/></IconButton>
}

export const CopyToClipboard = ({text, buttonText}: CopyToClipboardProps) => {
    const [open, setOpen] = useState(false)
    
    const handleClick = () => {
      setOpen(true)
      navigator.clipboard.writeText(text)
    }
    
    return (
        <>
          <CopyButton buttonText={buttonText} handleClick={handleClick}/>
          <Snackbar
            open={open}
            onClose={() => setOpen(false)}
            autoHideDuration={2500}
            message="Copied to clipboard!"
          />
        </>
    )
}

