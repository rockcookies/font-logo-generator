'use client'
import Link from 'next/link'

export function Logo() {
  return (
    <div className='flex cursor-pointer items-center space-x-3'>
      <Link href='/'>
        <div className='group relative'>
          <div className='from-primary to-primary/60 absolute -inset-1 rounded-md bg-gradient-to-r opacity-75 blur-sm transition duration-200 group-hover:opacity-100'></div>
          <div className='relative'>
            <div className='relative h-10 w-10 transform transition duration-200 group-hover:scale-105'>
              <div className='from-primary to-chart-2 absolute inset-0 rounded-lg bg-gradient-to-r'></div>
              <div className='absolute inset-0 overflow-hidden rounded-lg'>
                <div className='absolute inset-0 opacity-20'>
                  <div className='bg-background/40 absolute top-[20%] left-[10%] h-[1px] w-[80%]'></div>
                  <div className='bg-background/40 absolute top-[40%] left-[15%] h-[1px] w-[70%]'></div>
                  <div className='bg-background/40 absolute top-[60%] left-[20%] h-[1px] w-[60%]'></div>
                  <div className='bg-background/40 absolute top-[80%] left-[25%] h-[1px] w-[50%]'></div>
                  <div className='absolute top-1 right-1 bottom-1 left-1 h-2 w-2 rounded-tr border-t-2 border-r-2 border-white/30'></div>
                  <div className='absolute top-1 right-1 bottom-1 left-1 h-2 w-2 rounded-bl border-b-2 border-l-2 border-white/30'></div>
                </div>
              </div>
              <div className='absolute inset-[3px] flex items-center justify-center rounded-lg bg-[#030014]'>
                <span className='text-xl font-bold text-white'>FL</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
      <div className='flex flex-col'>
        <span className='from-foreground to-foreground/80 bg-gradient-to-r bg-clip-text text-xl font-bold tracking-tight text-transparent'>
          Font Logo Generator
        </span>
        <span className='text-muted-foreground text-xs'>
          The ultimate tool for converting Google Fonts to SVG paths
        </span>
      </div>
    </div>
  )
}
