import { assets } from '@/assets/assets'
import Image from 'next/image'
import React, { useEffect } from 'react'
import Markdown from 'react-markdown'
import toast from 'react-hot-toast'
import Prism from 'prismjs'

const Messages = ({ role, content }: { role: string; content: string }) => {
  useEffect(() => {
    Prism.highlightAll()
  }, [content])

  const copyMessage = () => {
    navigator.clipboard.writeText(content)
    toast.success('Message copied to clipboard')
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard')
  }

  // Use 'components' (not 'renderers') for react-markdown v8+
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const codeText = String(children).replace(/\n$/, '')
      if (inline) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        )
      }
      // Block code: use <pre> as the wrapper and put button INSIDE
      return (
        <pre className={`${className} relative group my-4`} {...props}>
          <code>{children}</code>
          <button
            type="button"
            onClick={() => copyCode(codeText)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs px-2 py-1 rounded"
          >
            Copy
          </button>
        </pre>
      )
    },
  }

  return (
    <div className="flex flex-col items-center w-full max-w-full max-w-3xl text-sm">
      <div className={`flex flex-col w-full mb-8 ${role === 'user' && 'items-end'}`}>
        <div
          className={`group relative flex max-w-2xl py-3 rounded-xl ${
            role === 'user' ? 'bg-[#414158] px-5' : 'gap-3'
          }`}
        >
          <div
            className={`opacity-0 group-hover:opacity-100 absolute ${
              role === 'user' ? '-left-16 top-2.5 ' : 'left-9 -bottom-6'
            } transition-all`}
          >
            <div className="flex items-center gap-2 opacity-70">
              {role === 'user' ? (
                <>
                  <Image
                    onClick={copyMessage}
                    src={assets.copy_icon}
                    alt=""
                    className="w-4 cursor-pointer"
                  />
                  <Image src={assets.pencil_icon} alt="" className="w-4.5 cursor-pointer" />
                </>
              ) : (
                <>
                  <Image
                    onClick={copyMessage}
                    src={assets.copy_icon}
                    alt=""
                    className="w-4.5 cursor-pointer"
                  />
                  <Image src={assets.regenerate_icon} alt="" className="w-4 cursor-pointer" />
                  <Image src={assets.like_icon} alt="" className="w-4 cursor-pointer" />
                  <Image src={assets.dislike_icon} alt="" className="w-4 cursor-pointer" />
                </>
              )}
            </div>
          </div>
          {role === 'user' ? (
            <span className="text-white/90">{content}</span>
          ) : (
            <>
              <Image
                src={assets.logo_icon}
                alt=""
                className="h-9 w-9 p-1 border border-white/15 rounded-full"
              />
              <div className="space-y-4 w-full overflow-scroll">
                <Markdown components={components}>{content}</Markdown>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages