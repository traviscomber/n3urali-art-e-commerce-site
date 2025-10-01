"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, DollarSign, Calendar, Shield, ArrowLeft, Wallet, Copy } from "lucide-react"
import { Contract069 } from "./contract-069"

interface Contract {
  id: string
  customer: string
  status: "active" | "completed" | "pending"
  totalAmount: number
  imageCount: number
  resolution: string
  commission: number
  terms: string[]
  startDate: string
  completionDate?: string
  depositAddress?: string
  depositNetwork?: string
}

export default function ContractsPage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [showFullContract, setShowFullContract] = useState(false)

  const contracts: Contract[] = [
    {
      id: "069",
      customer: "Labyrinth + Neuralia",
      status: "active",
      totalAmount: 23550000, // Updated from 3000 to 1500 USD, now in IDR
      imageCount: 20, // Updated from 50 to 20
      resolution: "4K",
      commission: 15,
      terms: [
        "Work ends when received by Labyrinth",
        "May not redistribute original images",
        "Can use images as part of their creation process",
        "Cannot sell as separate files",
        "Full 4K resolution delivery",
      ],
      startDate: "2025-01-10",
      depositAddress: "1750002001195",
      depositNetwork: "Bank Mandiri - Indonesia",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (showFullContract) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-slate-900 shadow-lg border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFullContract(false)}
                className="bg-white hover:bg-gray-100 text-slate-900 border-slate-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Contracts
              </Button>
              <div>
                <h1 className="text-4xl font-bold text-white">Contract #069 - Full Document</h1>
                <p className="text-xl text-slate-300 font-medium">Labyrinth + Neuralia Agreement</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Contract069 />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-900 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/simple-admin")}
              className="bg-white hover:bg-gray-100 text-slate-900 border-slate-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white">Customer Contracts</h1>
              <p className="text-xl text-slate-300 font-medium">Private contract management</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Contracts</p>
                  <p className="text-3xl font-bold text-slate-900">{contracts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Value</p>
                  <p className="text-3xl font-bold text-slate-900">
                    Rp {contracts.reduce((sum, c) => sum + c.totalAmount, 0).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Contracts</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {contracts.filter((c) => c.status === "active").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-slate-200">
            <CardContent className="p-6 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Images Delivered</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {contracts.reduce((sum, c) => sum + c.imageCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {contracts.map((contract) => (
            <Card key={contract.id} className="overflow-hidden bg-white border-2 border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 border-b border-orange-700">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white flex items-center gap-3">
                      {contract.customer}
                      <Badge className={getStatusColor(contract.status)}>{contract.status.toUpperCase()}</Badge>
                    </CardTitle>
                    <CardDescription className="text-base mt-1 text-orange-100">
                      Contract #{contract.id} • Started {new Date(contract.startDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">Rp {contract.totalAmount.toLocaleString("id-ID")}</p>
                    <p className="text-sm text-orange-100">Total Contract Value</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="mb-6">
                  <Button
                    onClick={() => setShowFullContract(true)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    View Full Contract Document
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      Contract Details
                    </h3>
                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex justify-between">
                        <span className="text-slate-700 font-medium">Image Count:</span>
                        <span className="font-bold text-slate-900">{contract.imageCount} images</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 font-medium">Resolution:</span>
                        <span className="font-bold text-slate-900">{contract.resolution}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 font-medium">Commission:</span>
                        <span className="font-bold text-green-700">{contract.commission}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 font-medium">Commission Amount:</span>
                        <span className="font-bold text-green-700">
                          Rp {((contract.totalAmount * contract.commission) / 100).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 font-medium">Net Amount:</span>
                        <span className="font-bold text-slate-900">
                          Rp{" "}
                          {(contract.totalAmount - (contract.totalAmount * contract.commission) / 100).toLocaleString(
                            "id-ID",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-orange-600" />
                      Terms & Conditions
                    </h3>
                    <div className="space-y-2">
                      {contract.terms.map((term, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-slate-900 flex-1 font-medium">{term}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {contract.depositAddress && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                      <Wallet className="h-5 w-5 text-orange-600" />
                      Payment Information
                    </h3>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border-2 border-orange-300">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">Bank Name</p>
                          <div className="bg-white p-3 rounded-lg border border-orange-200">
                            <p className="font-bold text-slate-900 text-lg">{contract.depositNetwork}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">Beneficiary Name</p>
                          <div className="bg-white p-3 rounded-lg border border-orange-200">
                            <p className="font-bold text-slate-900 text-lg">Juan Francisco Vial Comber</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">Account Number</p>
                          <div className="bg-white p-4 rounded-lg border border-orange-200 flex items-center justify-between gap-3">
                            <code className="font-mono text-sm text-slate-900 break-all flex-1">
                              {contract.depositAddress}
                            </code>
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard(contract.depositAddress!)}
                              className="bg-orange-600 hover:bg-orange-700 text-white flex-shrink-0"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              {copied ? "Copied!" : "Copy"}
                            </Button>
                          </div>
                        </div>
                        <div className="bg-orange-200 border border-orange-400 rounded-lg p-3">
                          <p className="text-sm text-orange-900 font-medium">
                            ⚠️ Important: Please ensure bank transfers are made to the correct account number at{" "}
                            {contract.depositNetwork}. Verify all details before making payment.
                          </p>
                        </div>
                        <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4 mt-3">
                          <p className="text-sm font-bold text-blue-900 mb-2">💳 Payment Requirement:</p>
                          <p className="text-sm text-blue-900 font-medium">
                            100% deposit must be received before download link is provided. The process is in real-time
                            - once payment is confirmed, access will be granted immediately.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <p className="text-sm font-medium text-slate-600 mb-1">Start Date</p>
                      <p className="font-bold text-slate-900">{new Date(contract.startDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <p className="text-sm font-medium text-slate-600 mb-1">Completion</p>
                      <p className="font-bold text-slate-900">
                        {contract.completionDate
                          ? new Date(contract.completionDate).toLocaleDateString()
                          : "Real-time upon payment"}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <p className="text-sm font-medium text-slate-600 mb-1">Status</p>
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status === "active" ? "In Progress" : contract.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-2 border-orange-300 bg-orange-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Shield className="h-6 w-6 text-white flex-shrink-0" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-900 mb-2">Confidential Information</h3>
                <p className="text-orange-900 font-medium leading-relaxed">
                  This page contains sensitive business information. All contract details, pricing, and terms are
                  confidential and should not be shared with unauthorized parties. Access is restricted to authenticated
                  administrators only.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
