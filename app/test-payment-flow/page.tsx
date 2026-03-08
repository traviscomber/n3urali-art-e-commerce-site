'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react'

// Mark this page as dynamic since it uses client-side hooks
export const dynamic = 'force-dynamic'

export default function TestPaymentFlowPage() {
  const [simulationLog, setSimulationLog] = useState<Array<{
    step: string
    status: 'pending' | 'success' | 'error'
    message: string
    data?: any
  }>>([])
  const [isRunning, setIsRunning] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState('')

  const addLog = (step: string, status: 'pending' | 'success' | 'error', message: string, data?: any) => {
    setSimulationLog(prev => [...prev, { step, status, message, data }])
  }

  const runSimulation = async () => {
    setIsRunning(true)
    setSimulationLog([])
    setWhatsappMessage('')

    try {
      // Step 1: Fetch pending orders
      addLog('Step 1', 'pending', 'Fetching pending orders from database...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const ordersResponse = await fetch('/api/test/get-pending-orders')
      const ordersData = await ordersResponse.json()
      
      if (ordersData.success && ordersData.orders.length > 0) {
        addLog('Step 1', 'success', `Found ${ordersData.orders.length} pending order(s)`, ordersData.orders)
      } else {
        addLog('Step 1', 'error', 'No pending orders found. Create a test order first!')
        setIsRunning(false)
        return
      }

      const testOrder = ordersData.orders[0]

      // Step 2: Fetch order items and images
      addLog('Step 2', 'pending', `Fetching order items for order ${testOrder.id}...`)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const itemsResponse = await fetch(`/api/test/get-order-items?orderId=${testOrder.id}`)
      const itemsData = await itemsResponse.json()
      
      if (itemsData.success && itemsData.items.length > 0) {
        addLog('Step 2', 'success', `Found ${itemsData.items.length} item(s) in order`, itemsData.items)
      } else {
        addLog('Step 2', 'error', 'No items found in order!')
        setIsRunning(false)
        return
      }

      // Step 3: Check for original_file_url
      addLog('Step 3', 'pending', 'Checking for high-resolution Backblaze URLs...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const hasOriginalUrls = itemsData.items.every((item: any) => item.original_file_url)
      
      if (hasOriginalUrls) {
        addLog('Step 3', 'success', 'All images have original_file_url (Backblaze links)', 
          itemsData.items.map((i: any) => ({ title: i.title, url: i.original_file_url }))
        )
      } else {
        addLog('Step 3', 'error', 'Some images are missing original_file_url!')
        setIsRunning(false)
        return
      }

      // Step 4: Simulate approval and token generation
      addLog('Step 4', 'pending', 'Approving order and generating download tokens...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const approveResponse = await fetch('/api/test/simulate-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: testOrder.id })
      })
      const approveData = await approveResponse.json()
      
      if (approveData.success) {
        addLog('Step 4', 'success', `Generated ${approveData.downloadLinks.length} download link(s)`, approveData.downloadLinks)
      } else {
        addLog('Step 4', 'error', `Failed to approve: ${approveData.error}`)
        setIsRunning(false)
        return
      }

      // Step 5: Build WhatsApp message
      addLog('Step 5', 'pending', 'Building WhatsApp notification message...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const message = `🎉 Payment Approved - Download Links Ready

Customer: ${testOrder.user_name}
Email: ${testOrder.user_email}
Amount: $${testOrder.total_amount} USDT

High-Resolution Download Links:
${approveData.downloadLinks.map((link: any) => 
  `📷 ${link.imageTitle}\n${link.url}`
).join('\n\n')}

⏰ Links expire in 1 year
🔢 Up to 10 downloads per image

Please forward these links to the customer.`

      setWhatsappMessage(message)
      addLog('Step 5', 'success', 'WhatsApp message generated successfully', { message })

      // Final step
      addLog('Final', 'success', '✅ Simulation complete! WhatsApp would now open with the message below.')
      
    } catch (error: any) {
      addLog('Error', 'error', `Simulation failed: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const createTestOrder = async () => {
    try {
      const response = await fetch('/api/test/create-order', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        alert(`Test order created! Order ID: ${data.orderId}`)
      }
    } catch (error: any) {
      alert(`Failed to create test order: ${error.message}`)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Approval Flow Simulation</h1>
        <p className="text-muted-foreground">
          Test the complete flow from pending order to WhatsApp notification with download links
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        <Button onClick={runSimulation} disabled={isRunning} size="lg">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Simulation...
            </>
          ) : (
            'Run Simulation'
          )}
        </Button>
        <Button onClick={createTestOrder} variant="outline">
          Create Test Order
        </Button>
      </div>

      {simulationLog.length > 0 && (
        <div className="space-y-4 mb-8">
          {simulationLog.map((log, index) => (
            <Card key={index} className={
              log.status === 'success' ? 'border-green-500' :
              log.status === 'error' ? 'border-red-500' :
              'border-yellow-500'
            }>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {log.status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {log.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                  {log.status === 'pending' && <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />}
                  <CardTitle className="text-lg">{log.step}</CardTitle>
                  <Badge variant={
                    log.status === 'success' ? 'default' :
                    log.status === 'error' ? 'destructive' :
                    'secondary'
                  }>
                    {log.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">{log.message}</p>
                {log.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-muted-foreground">
                      View data
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {whatsappMessage && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              WhatsApp Message Preview
              <ExternalLink className="h-4 w-4" />
            </CardTitle>
            <CardDescription>
              This message would be sent to +56 9 4094 6660
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap p-4 bg-muted rounded text-sm">
              {whatsappMessage}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
