import type { CopyButtonProps, CopyToClipboardProps } from './CopyToClipboard.d';
import styles from './ClipboardCopy.module.css';


import { IconButton, Button, Snackbar } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from 'react'

const CopyButton = ({buttonText, handleClick} : CopyButtonProps) => {
  return buttonText?
  <Button style={{color: 'black', marginTop:'1em'}} onClick={handleClick} variant="outlined" endIcon={<ContentCopyIcon />} > {buttonText} </Button>
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
            message="Link was copied to clipboard"
          />
        </>
    )
}

