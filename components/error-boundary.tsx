'use client'

import React, { ReactNode, ErrorInfo } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    })

    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    // Optionally reload the page
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">
              عذراً، حدث خطأ
            </h1>
            <p className="text-center text-muted-foreground mb-4 max-w-md">
              حدثت مشكلة غير متوقعة. يرجى محاولة إعادة تحميل الصفحة أو العودة لاحقاً.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 max-w-md w-full p-2 bg-muted rounded">
                <summary className="cursor-pointer font-semibold">
                  تفاصيل الخطأ (التطوير فقط)
                </summary>
                <pre className="mt-2 text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <div className="flex gap-2">
              <Button
                onClick={this.handleReset}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة محاولة
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
              >
                العودة للصفحة الرئيسية
              </Button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
