import { hasOwnProperty, isBrowser } from './lang'

const rafWithPolyfill = ((): {
  invoke: (fn: FrameRequestCallback) => number
  cancel: (id: number) => void
} => {
  const root = (isBrowser() ? window : (global as any)) as Window

  let requestAnimationFrame = root.requestAnimationFrame
  let cancelAnimationFrame = root.cancelAnimationFrame

  if (!requestAnimationFrame || !cancelAnimationFrame) {
    let prev = Date.now()

    requestAnimationFrame = fn => {
      const curr = Date.now()
      const ms = Math.max(0, 16 - (curr - prev))
      const id = setTimeout(fn, ms)
      prev = curr + ms
      return id
    }

    cancelAnimationFrame = root.clearTimeout
  }

  return {
    invoke: requestAnimationFrame.bind(root),
    cancel: cancelAnimationFrame.bind(root),
  }
})()

export const raf = rafWithPolyfill.invoke
export const cancelRaf = rafWithPolyfill.cancel

// double raf for animation
export const doubleRaf = (fn: FrameRequestCallback): void => {
  raf(() => raf(fn))
}

export const selectFile = (
  callback: (fs: FileList | null) => void,
  options: {
    multiple?: boolean
    accept?: string
    capture?: string
    directory?: boolean
  } = {}
) => {
  if (!isBrowser()) return

  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = options.multiple != null ? options.multiple : false
  input.accept = options.accept || '*'
  input.webkitdirectory = options.directory != null ? options.directory : false
  input.style.display = 'none'

  if (hasOwnProperty(options, 'capture')) {
    input.capture = options.capture!
  }

  input.onchange = event => {
    const result = event.target as HTMLInputElement
    callback(result.files)
  }

  document.body.appendChild(input)
  input.click()

  setTimeout(() => {
    input.remove()
  }, 0)
}
