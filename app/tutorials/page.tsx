import { Metadata } from 'next'
import { PageInner } from '../_component/PageInner'

export const metadata: Metadata = {
  title: 'Font Logo Generator Tutorials - Create Professional Text Logos',
  description:
    'Learn how to create stunning text-based logos with our Font Logo Generator. Step-by-step tutorials for designing professional logos using custom fonts.',
}

export default function TutorialsPage() {
  return (
    <PageInner>
      <div className='container mx-auto mt-20 p-4 md:max-w-5xl'>
        <div className='grid gap-6'>
          <div className='p-6'>
            <h2 className='mb-4 text-2xl font-semibold'>Getting Started with Font Logo Creation</h2>
            <p className='text-muted-foreground mb-4'>
              Learn the fundamentals of creating professional text-based logos with our powerful font logo generator.
              Perfect for designers, entrepreneurs, and brands looking to create memorable visual identities.
            </p>
            <ul className='list-disc space-y-2 pl-6'>
              <li>Choosing the perfect font for your brand identity</li>
              <li>Understanding logo typography principles</li>
              <li>Customizing letter spacing and text effects</li>
              <li>Creating logos that work across different media</li>
              <li>Exporting high-quality logo files</li>
            </ul>
          </div>
          <div className='p-6'>
            <h2 className='mb-4 text-2xl font-semibold'>Advanced Logo Design Techniques</h2>
            <p className='text-muted-foreground mb-4'>
              Master advanced logo design techniques to create unique and memorable brand identities that stand out in
              the market.
            </p>
            <ul className='list-disc space-y-2 pl-6'>
              <li>Creating custom text effects and shadows</li>
              <li>Working with color gradients and themes</li>
              <li>Designing scalable logos for all sizes</li>
              <li>Combining text with geometric elements</li>
              <li>Creating logo variations and brand systems</li>
            </ul>
          </div>
          <div className='p-6'>
            <h2 className='mb-4 text-2xl font-semibold'>Why Choose Our Font Logo Generator</h2>
            <p className='text-muted-foreground mb-4'>
              Compared to other logo creation tools, our Font Logo Generator provides professional-grade features for
              creating stunning text-based logos:
            </p>
            <div className='space-y-4'>
              <div className='bg-muted/50 rounded-lg p-4'>
                <h3 className='mb-2 text-lg font-medium'>Traditional Logo Tools</h3>
                <p className='mb-2'>Basic logo generators often lack:</p>
                <ul className='list-disc space-y-1 pl-6'>
                  <li>Limited font selection and customization</li>
                  <li>Basic text effects and styling options</li>
                  <li>Poor typography controls</li>
                  <li>Limited export quality and formats</li>
                  <li>No real-time preview capabilities</li>
                </ul>
              </div>
              <div className='bg-primary/5 rounded-lg p-4'>
                <h3 className='mb-2 text-lg font-medium'>Our Font Logo Generator Features</h3>
                <ul className='list-disc space-y-1 pl-6'>
                  <li>Extensive library of premium fonts</li>
                  <li>Advanced typography controls and kerning</li>
                  <li>Professional text effects and animations</li>
                  <li>Real-time logo preview and editing</li>
                  <li>High-resolution exports (SVG, DXF)</li>
                  <li>Brand-focused design recommendations</li>
                  <li>Responsive design for all devices</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageInner>
  )
}
