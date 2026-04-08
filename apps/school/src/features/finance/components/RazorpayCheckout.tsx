import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface RazorpayCheckoutProps {
  studentFeeId: string
  studentId: string
  studentName: string
  feeTypeName: string
  amount: number // in rupees
  onSuccess?: (data: { receiptNumber: string; amount: number }) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

async function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) return true

  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function RazorpayCheckout({ studentFeeId, studentId, studentName, feeTypeName, amount, onSuccess }: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [paid, setPaid] = useState(false)
  const { toast } = useToast()

  const handlePay = async () => {
    setLoading(true)

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast({ title: 'Error', description: 'Failed to load payment gateway. Please try again.', variant: 'destructive' })
        setLoading(false)
        return
      }

      // Create order via backend
      const orderRes = await fetch('/api/parent-portal/pay-fee', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentFeeId, amount: Math.round(amount * 100) }),
      })

      if (!orderRes.ok) {
        const err = await orderRes.json()
        toast({ title: 'Error', description: err.message || 'Failed to create payment order', variant: 'destructive' })
        setLoading(false)
        return
      }

      const order = await orderRes.json()

      // Open Razorpay checkout
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'School Fee Payment',
        description: `${feeTypeName} - ${studentName}`,
        order_id: order.orderId,
        handler: async (response: any) => {
          // Verify payment
          try {
            const verifyRes = await fetch('/api/parent-portal/verify-payment', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                studentFeeId,
                studentId,
              }),
            })

            if (verifyRes.ok) {
              const result = await verifyRes.json()
              setPaid(true)
              toast({ title: 'Payment Successful', description: `Receipt: ${result.receiptNumber}` })
              onSuccess?.({ receiptNumber: result.receiptNumber, amount: result.amount })
            } else {
              toast({ title: 'Error', description: 'Payment verification failed. Please contact admin.', variant: 'destructive' })
            }
          } catch {
            toast({ title: 'Error', description: 'Payment verification failed. Please contact admin.', variant: 'destructive' })
          }
          setLoading(false)
        },
        prefill: {
          name: studentName,
        },
        theme: {
          color: '#6d28d9',
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      toast({ title: 'Error', description: 'Failed to initiate payment. Please try again.', variant: 'destructive' })
      setLoading(false)
    }
  }

  if (paid) {
    return (
      <Button variant="ghost" size="sm" disabled className="text-green-600">
        <CheckCircle className="h-4 w-4 mr-1" />
        Paid
      </Button>
    )
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handlePay}
      disabled={loading || amount <= 0}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4 mr-1" />
      )}
      Pay Online
    </Button>
  )
}
