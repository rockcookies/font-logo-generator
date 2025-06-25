import React from 'react'

export function Footer(): ReturnType<React.FC> {
  return (
    <footer className='mt-auto w-full'>
      <div className='text-muted-foreground container mx-auto px-4 py-3 text-center text-sm'>
        © {new Date().getFullYear()} Font Logo Generator. All rights reserved.
      </div>
    </footer>
  )
}
