import { Button } from '@/core/ui/button'
import { X } from 'lucide-react'
import { useAsync } from './Async/hooks'
import opentype, { Font } from 'opentype.js'
import { errRes, okRes } from '@/core/utils/lang'
import { Res } from '@/core/utils/types'
import { toast } from 'sonner'
import { selectFile } from '@/core/utils/dom'

interface CProps {
  onFontLoaded?: (font: Font, fileName: string) => void
  onFontRemoved?: () => void
  currentFileName?: string
}

export default function CustomFontUploader({ currentFileName, ...props }: CProps): ReturnType<React.FC> {
  const [{ loading }, { run: loadFont }] = useAsync(
    async (file: File): Promise<Res<Font, string>> => {
      if (!file.name.match(/\.(ttf|otf)$/i)) {
        return errRes('Please upload a valid font file (.ttf or .otf)')
      }

      try {
        const arrayBuffer = await file.arrayBuffer()
        const font = opentype.parse(arrayBuffer)
        return okRes(font)
      } catch (err) {
        console.error('Error loading font:', err)
        return errRes('Failed to load font. Please try again.')
      }
    },
    {
      onSuccess: (res, [file]) => {
        if (res.isError) {
          toast.error(res.error)
          return
        }

        toast.success('Font loaded successfully')
        props.onFontLoaded?.(res.value, file.name)
      },
    }
  )

  if (currentFileName) {
    return (
      <div className='flex items-center gap-2'>
        <Button variant='outline' className='flex-1 justify-start' disabled={loading}>
          <span className='truncate'>{currentFileName}</span>
        </Button>
        <Button variant='outline' size='icon' onClick={props.onFontRemoved} className='h-9 w-9'>
          <X className='h-4 w-4' />
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant='outline'
      disabled={loading}
      className='w-full bg-transparent'
      onClick={() => {
        selectFile(
          files => {
            if (files && files.length > 0) {
              loadFont(files[0])
            }
          },
          {
            accept: '.ttf,.otf',
          }
        )
      }}
    >
      {loading ? 'Loading...' : 'Upload Custom Font'}
    </Button>
  )
}
