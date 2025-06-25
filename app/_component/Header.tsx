'use client'

import { Button } from '@/core/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/core/ui/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/core/ui/sheet'
import { MenuIcon, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { ReactNode, useMemo, useState } from 'react'

const Logo = () => {
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
        <span className='text-muted-foreground text-xs'>The ultimate Font Logo Generator</span>
      </div>
    </div>
  )
}

export function Header() {
  const { theme, systemTheme, setTheme } = useTheme()
  const [sheetOpen, setSheetOpen] = useState(false)

  const isLight = (theme === 'system' ? systemTheme : theme) === 'light'

  const themeItems = useMemo<Array<{ icon: ReactNode; label: string; theme: string }>>(() => {
    return [
      {
        icon: <Monitor />,
        label: 'System',
        theme: 'system',
      },
      {
        icon: <Sun />,
        label: 'Light',
        theme: 'light',
      },
      {
        icon: <Moon />,
        label: 'Dark',
        theme: 'dark',
      },
    ]
  }, [])

  return (
    <header className='bg-background/80 fixed top-0 z-50 w-full border-b shadow-sm backdrop-blur-xl'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          <Logo />
          <div className='flex items-center space-x-1'>
            <div className='hidden items-center space-x-1 md:flex'>
              <Link href='/'>
                <Button variant='ghost' className='text-muted-foreground hover:text-foreground'>
                  Home
                </Button>
              </Link>
              <Link href='/tutorials'>
                <Button variant='ghost' className='text-muted-foreground hover:text-foreground'>
                  Tutorials
                </Button>
              </Link>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='text-muted-foreground hover:text-foreground'>
                  {isLight ? <Sun /> : <Moon />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {themeItems.map((item, index) => {
                  return (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => {
                        setTheme(item.theme)
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant='secondary' size='icon' className='md:hidden'>
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='w-66 p-0'>
                <SheetHeader>
                  <SheetTitle>Font Logo Generator</SheetTitle>
                  <SheetDescription>The ultimate Font Logo Generator</SheetDescription>
                </SheetHeader>
                <div className='flex flex-col items-center justify-center gap-2'>
                  <Link href='/'>
                    <Button variant='ghost' className='text-muted-foreground hover:text-foreground'>
                      Home
                    </Button>
                  </Link>
                  <Link href='/tutorials'>
                    <Button variant='ghost' className='text-muted-foreground hover:text-foreground'>
                      Tutorials
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
