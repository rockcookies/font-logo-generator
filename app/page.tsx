'use client'

import { FONT_LOGO_LIST, FONT_TEXT_LIST } from '@/core/consts'
import { useMont } from '@/core/hooks/use-life-cycle'
import { GoogleFontItem } from '@/core/types'
import { Button } from '@/core/ui/button'
import { Input } from '@/core/ui/input'
import { Label } from '@/core/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/core/ui/select'
import { Switch } from '@/core/ui/switch'
import { debounce } from '@/core/utils/function'
import makerjs from 'makerjs'
import opentype from 'opentype.js'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAsync } from './_component/Async/hooks'
import CustomFontUploader from './_component/CustomFontUploader'
import { Header } from './_component/Header'
import { useTheme } from 'next-themes'
import { Footer } from './_component/Footer'

type FillRule = 'nonzero' | 'evenodd'

export default function Home() {
  const { theme, systemTheme } = useTheme()
  const isLight = (theme === 'system' ? systemTheme : theme) === 'light'

  const [selectedFont, setSelectedFont] = useState<GoogleFontItem>(FONT_LOGO_LIST[0])

  const [selectedVariant, setSelectedVariant] = useState<string>('regular')
  const [text, setText] = useState('Nexus')
  const [fontSize, setFontSize] = useState(50)
  const [stroke, setStroke] = useState<string>(() => (isLight ? '#000000' : '#ffffff'))
  const [strokeWidth, setStrokeWidth] = useState('0.25mm')
  const [fill, setFill] = useState<string>(() => (isLight ? '#000000' : '#ffffff'))
  const [svgPath, setSvgPath] = useState<string>('')
  const [dxfPath, setDxfPath] = useState<string>('')
  const [customFont, setCustomFont] = useState<opentype.Font | undefined>()
  const [customFontName, setCustomFontName] = useState<string | undefined>()

  // 新增配置项
  const [union, setUnion] = useState(true)
  const [filled, setFilled] = useState(true)
  const [kerning, setKerning] = useState(true)
  const [separate, setSeparate] = useState(false)
  const [bezierAccuracy, setBezierAccuracy] = useState(0.5)
  const [fillRule, setFillRule] = useState<FillRule>('evenodd')
  const [dxfUnits, setDxfUnits] = useState('mm')

  const [{ data: googleFont }, { run: loadFont }] = useAsync(
    async (font: GoogleFontItem, variant: string): Promise<opentype.Font | undefined> => {
      const url = font.files?.[variant]

      if (url) {
        const resp = await fetch(url)
        const arrayBuffer = await resp.arrayBuffer()
        const font = opentype.parse(arrayBuffer)
        return font
      }
    }
  )

  const copySVG = () => {
    if (!svgPath) return
    navigator.clipboard.writeText(svgPath)
    toast.success('SVG code copied to clipboard')
  }

  const downloadSVG = () => {
    if (!svgPath) return
    const blob = new Blob([svgPath], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${text}.svg`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('SVG file downloaded successfully')
  }

  const downloadDXF = () => {
    if (!dxfPath) return
    const blob = new Blob([dxfPath], { type: 'application/dxf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${text}.dxf`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('DXF file downloaded successfully')
  }

  const generatePath = useMemo(() => {
    const generate = ({
      bezierAccuracy,
      font,
      dxfUnits,
      fill,
      fillRule,
      filled,
      fontSize,
      kerning,
      separate,
      stroke,
      strokeWidth,
      text,
      union,
    }: {
      bezierAccuracy: number
      font: opentype.Font | null | undefined
      dxfUnits: string
      fill: string
      fillRule: FillRule
      filled: boolean
      fontSize: number
      kerning: boolean
      separate: boolean
      stroke: string
      strokeWidth: string
      text: string
      union: boolean
    }) => {
      if (!font || !text) {
        setSvgPath('')
        setDxfPath('')
        return
      }

      try {
        const textModel = new makerjs.models.Text(font as any, text, fontSize, union, false, bezierAccuracy, {
          kerning,
        })

        if (separate) {
          for (const i in textModel.models) {
            textModel.models[i].layer = i
          }
        }

        // 生成 SVG
        const svg = makerjs.exporter.toSVG(textModel, {
          fill: filled ? fill : undefined,
          stroke: stroke,
          strokeWidth: strokeWidth,
          fillRule: fillRule,
          scalingStroke: true,
        })

        // 生成 DXF
        const dxf = makerjs.exporter.toDXF(textModel, {
          units: dxfUnits,
          usePOLYLINE: true,
        })

        setSvgPath(svg)
        setDxfPath(dxf)
      } catch (err) {
        console.error('Error generating SVG:', err)
      }
    }

    const debouncedGenerate = debounce(generate, 500)
    return debouncedGenerate
  }, [])

  useEffect(() => {
    generatePath({
      bezierAccuracy,
      font: customFont || googleFont,
      dxfUnits,
      fill,
      fillRule,
      filled,
      fontSize,
      kerning,
      separate,
      stroke,
      strokeWidth,
      text,
      union,
    })
  }, [
    bezierAccuracy,
    customFont,
    dxfUnits,
    fill,
    fillRule,
    filled,
    fontSize,
    generatePath,
    googleFont,
    kerning,
    separate,
    stroke,
    strokeWidth,
    text,
    union,
  ])

  useMont(() => {
    loadFont(selectedFont, selectedVariant)
  })

  const renderPreview = () => {
    let content: ReactNode

    if (text.length <= 0) {
      content = <span className='text-gray-400'>Please enter content</span>
    } else if (svgPath.length > 0) {
      content = <div dangerouslySetInnerHTML={{ __html: svgPath }} />
    } else {
      content = <span className='text-gray-400'>Loading font...</span>
    }

    return (
      <div className='flex-1'>
        <h2 className='mb-4 text-3xl font-bold'>Preview</h2>
        <div className='flex h-64 items-center justify-center overflow-auto rounded-lg border shadow-sm'>{content}</div>
      </div>
    )
  }

  const renderGenerate = () => {
    return (
      <div className='flex-1'>
        <h2 className='mb-4 text-3xl font-bold'>Generate</h2>

        <div className='flex flex-col justify-center gap-4 overflow-auto rounded-lg border px-6 py-4 md:h-64'>
          <div className='flex w-full flex-col gap-2'>
            <Label htmlFor='text'>Logo Text</Label>
            <Input id='text' value={text} onChange={e => setText(e.target.value)} placeholder='Enter the Logo text' />
          </div>

          <div className='flex w-full flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <Label htmlFor='logo-font'>Logo Font</Label>
              <span className='text-xs text-gray-500'>
                (View all on{' '}
                <a
                  href='https://fonts.google.com/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline'
                >
                  Google Font
                </a>
                ）
              </span>
            </div>

            <Select
              value={selectedFont?.family}
              onValueChange={newFamily => {
                const font = [...FONT_LOGO_LIST, ...FONT_TEXT_LIST].find(font => font.family === newFamily)

                if (font) {
                  const variants = font.variants || []

                  let variant = 'regular'

                  if (!variants.includes('regular') && variants.length > 0) {
                    variant = variants[0]
                  }

                  setSelectedVariant(variant)
                  setSelectedFont(font)
                  setCustomFont(undefined)
                  setCustomFontName(undefined)

                  loadFont(font, variant)
                }
              }}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select Recommend Logo Fonts' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Logo Fonts</SelectLabel>
                  {FONT_LOGO_LIST.map(font => {
                    return (
                      <SelectItem key={font.family} value={font.family}>
                        {font.family}
                      </SelectItem>
                    )
                  })}
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>Text Fonts</SelectLabel>
                  {FONT_TEXT_LIST.map(font => {
                    return (
                      <SelectItem key={font.family} value={font.family}>
                        {font.family}
                      </SelectItem>
                    )
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className='flex w-full flex-col gap-2 pt-4 md:flex-row'>
            <Button variant='outline' onClick={copySVG}>
              Copy Code
            </Button>
            <Button onClick={downloadSVG}>Download SVG</Button>
            <Button onClick={downloadDXF}>Download DXF</Button>
          </div>
        </div>
      </div>
    )
  }

  const renderSettings = () => {
    return (
      <div className='flex flex-col rounded-lg border px-6 pt-2 pb-6 md:flex-row md:gap-6'>
        <div className='flex flex-1 flex-col gap-4 pt-4'>
          {/* Custom Font */}
          <div className='flex w-full flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <Label htmlFor='logo-font'>Custom Font</Label>
              <span className='text-xs text-gray-500'>(optional)</span>
            </div>

            <CustomFontUploader
              onFontLoaded={(font, fileName) => {
                setCustomFont(font)
                setCustomFontName(fileName)
              }}
              onFontRemoved={() => {
                setCustomFont(undefined)
                setCustomFontName(undefined)
              }}
              currentFileName={customFontName}
            />
          </div>

          {/* Font Variant */}
          <div className='flex w-full flex-col gap-2'>
            <Label htmlFor='font-variant'>Font Variant</Label>
            <Select disabled={customFont != null} value={selectedVariant} onValueChange={setSelectedVariant}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select font variant' />
              </SelectTrigger>
              <SelectContent>
                {selectedFont.variants?.map((variant: string) => (
                  <SelectItem key={variant} value={variant}>
                    {variant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className='flex w-full flex-col gap-2'>
            <Label htmlFor='font-size'>Font Size</Label>
            <Input id='font-size' type='number' value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
          </div>

          {/* Bezier Curve Accuracy */}
          <div className='flex w-full flex-col gap-2'>
            <Label htmlFor='bezier-accuracy'>Bezier Curve Accuracy</Label>
            <Input
              id='bezier-accuracy'
              type='number'
              step='0.1'
              min='0.1'
              max='1'
              value={bezierAccuracy}
              onChange={e => setBezierAccuracy(Number(e.target.value))}
            />
          </div>
        </div>
        <div className='flex flex-1 flex-col gap-4 pt-4'>
          {/* Stroke Color */}
          <div className='flex w-full flex-col gap-2'>
            <Label htmlFor='stroke'>Stroke Color</Label>
            <Input id='stroke' type='color' value={stroke} onChange={e => setStroke(e.target.value)} />
          </div>

          {/* Stroke Width */}
          <div className='flex w-full flex-col gap-2'>
            <Label htmlFor='stroke-width'>Stroke Width</Label>
            <Input id='stroke-width' type='text' value={strokeWidth} onChange={e => setStrokeWidth(e.target.value)} />
          </div>

          {/* Fill Color */}
          <div className='flex w-full flex-col gap-2'>
            <Label htmlFor='fill'>Fill Color</Label>
            <Input id='fill' type='color' value={fill} onChange={e => setFill(e.target.value)} />
          </div>

          {/* DXF Units */}
          <div className='flex w-full flex-col gap-2'>
            <Label htmlFor='dxf-units'>DXF Units</Label>
            <Select value={dxfUnits} onValueChange={setDxfUnits}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select unit' />
              </SelectTrigger>
              <SelectContent>
                {Object.values(makerjs.unitType).map(unit => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='flex flex-1 flex-col gap-4 pt-4'>
          {/* Fill Rule */}
          <div className='flex w-full flex-col gap-2'>
            <Label htmlFor='fill-rule'>Fill Rule</Label>
            <Select value={fillRule} onValueChange={(value: FillRule) => setFillRule(value)}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select fill rule' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='nonzero'>nonzero</SelectItem>
                <SelectItem value='evenodd'>evenodd</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Merge Paths */}
          <div className='flex w-full items-center justify-between pt-2'>
            <Label htmlFor='union'>Merge Paths</Label>
            <Switch id='union' checked={union} onCheckedChange={setUnion} />
          </div>

          {/* Filled */}
          <div className='flex w-full items-center justify-between pt-2'>
            <Label htmlFor='filled'>Fill</Label>
            <Switch id='filled' checked={filled} onCheckedChange={setFilled} />
          </div>

          {/* Kerning */}
          <div className='flex w-full items-center justify-between pt-2'>
            <Label htmlFor='kerning'>Kerning</Label>
            <Switch id='kerning' checked={kerning} onCheckedChange={setKerning} />
          </div>

          {/* Separate Paths */}
          <div className='flex w-full items-center justify-between pt-2'>
            <Label htmlFor='separate'>Separate Paths</Label>
            <Switch id='separate' checked={separate} onCheckedChange={setSeparate} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className='mt-20'>
        {/* 标题行：SVG预览 和 SVG设置 */}
        <div className='container mx-auto p-4 md:max-w-5xl'>
          <div className='flex flex-col gap-4 md:flex-row md:gap-6'>
            {renderPreview()}
            {renderGenerate()}
          </div>

          {/* 标题行：SVG详细设置 */}
          <h2 className='mt-8 mb-4 text-3xl font-bold'>Settings</h2>
          {renderSettings()}
        </div>
      </main>
      <Footer />
    </>
  )
}
