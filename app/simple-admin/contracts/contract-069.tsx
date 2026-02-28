'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, Printer } from 'lucide-react'
import contractData from '@/lib/contracts/contract-069-data.json'

export function Contract069() {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const contractText = document.getElementById('contract-content')?.innerText || ''
    const blob = new Blob([contractText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Contract-069-Labyrinth-Neuralia.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 print:hidden">
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Print Contract
        </Button>
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download Contract
        </Button>
      </div>

      <Card className="p-8 bg-white" id="contract-content">
        <div className="max-w-4xl mx-auto space-y-6 text-slate-900">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-6">
            <h1 className="text-3xl font-bold mb-2">{contractData.title}</h1>
            <p className="text-lg">Contract #{contractData.contractNumber}</p>
            <p className="text-sm text-slate-600 mt-2">Effective Date: {contractData.effectiveDate}</p>
          </div>

          {/* Parties */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-slate-300 pb-2">PARTIES</h2>
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Provider:</p>
                <p className="ml-4">{contractData.parties.provider.name}</p>
                <p className="ml-4 text-sm text-slate-600">{contractData.parties.provider.type}</p>
                <p className="ml-4 text-sm text-slate-600">{contractData.parties.provider.operations}</p>
              </div>
              <div>
                <p className="font-semibold">Client:</p>
                <p className="ml-4">{contractData.parties.client.name}</p>
                <p className="text-sm text-slate-600">Location: {contractData.parties.client.location}</p>
              </div>
            </div>
          </section>

          {/* Recitals */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-slate-300 pb-2">RECITALS</h2>
            <p className="text-sm leading-relaxed">
              WHEREAS, Provider is engaged in the business of creating and licensing digital artwork and AI-generated
              images;
            </p>
            <p className="text-sm leading-relaxed">
              WHEREAS, Client desires to license certain digital images from Provider for use in Client's creative
              projects;
            </p>
            <p className="text-sm leading-relaxed">
              NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties
              agree as follows:
            </p>
          </section>

          {/* Articles */}
          {contractData.articles.map((article) => (
            <section key={article.number} className="space-y-4">
              <h2 className="text-xl font-bold border-b border-slate-300 pb-2">
                ARTICLE {article.number}: {article.title}
              </h2>
              <div className="space-y-2 ml-4">
                {article.sections.map((section) => (
                  <div key={section.number}>
                    {section.isList ? (
                      <>
                        <p className="font-semibold">
                          {section.number} {section.title}:
                        </p>
                        <ul className="list-disc ml-8 space-y-1">
                          {section.content.split(';').map((item, idx) => (
                            <li key={idx}>{item.trim()}</li>
                          ))}
                        </ul>
                      </>
                    ) : section.bankDetails ? (
                      <>
                        <p>
                          <span className="font-semibold">
                            {section.number} {section.title}:
                          </span>{' '}
                          {section.content}
                        </p>
                        <div className="bg-slate-100 p-4 rounded border border-slate-300 my-2 space-y-1">
                          <p className="font-semibold">Beneficiary Name:</p>
                          <p className="ml-4 font-mono text-sm">{section.bankDetails.beneficiaryName}</p>
                          <p className="font-semibold mt-2">Bank Name:</p>
                          <p className="ml-4 font-mono text-sm">{section.bankDetails.bankName}</p>
                          <p className="font-semibold mt-2">Account Number:</p>
                          <p className="ml-4 font-mono text-sm">{section.bankDetails.accountNumber}</p>
                          <p className="font-semibold mt-2">Country:</p>
                          <p className="ml-4 font-mono text-sm">{section.bankDetails.country}</p>
                        </div>
                      </>
                    ) : (
                      <p>
                        <span className="font-semibold">
                          {section.number} {section.title}:
                        </span>{' '}
                        {section.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Signatures */}
          <section className="space-y-6 mt-8 pt-6 border-t-2 border-slate-900">
            <h2 className="text-xl font-bold">ACCEPTANCE AND SIGNATURES</h2>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm font-semibold text-blue-900 mb-1">Signed Contract Available</p>
              <p className="text-sm text-blue-800">
                The fully executed version of this contract with original signatures can be viewed in the "Signed
                Contract" section on the{' '}
                <a href="/simple-admin/contracts" className="underline font-semibold hover:text-blue-600">
                  Contracts Summary Page
                </a>
                .
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-8">
              <div className="space-y-4">
                <p className="font-semibold">PROVIDER:</p>
                <p>{contractData.signatures.provider.organization}</p>
                <p className="text-sm text-slate-600 mt-2">By: {contractData.signatures.provider.signedBy}</p>
                <p className="text-sm text-slate-600">Title: {contractData.signatures.provider.title}</p>
              </div>

              <div className="space-y-4">
                <p className="font-semibold">CLIENT:</p>
                <p>{contractData.signatures.client.organization}</p>
                <p className="text-sm text-slate-600">{contractData.signatures.client.location}</p>
                <p className="text-sm text-slate-600 mt-2">By: {contractData.signatures.client.signedBy}</p>
              </div>
            </div>

            <div className="bg-slate-100 p-4 rounded border border-slate-300 mt-8">
              <p className="text-sm font-semibold mb-2">BANK TRANSFER PAYMENT CONFIRMATION:</p>
              <p className="text-xs text-slate-600">
                By sending payment to the specified bank account, Client acknowledges acceptance of all terms and
                conditions set forth in this Agreement. The bank transfer confirmation serves as acceptance and
                confirmation of this contract.
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-300">
            <p>
              Contract #{contractData.contractNumber} | Neuralia Digital Asset License Agreement
            </p>
            <p>Page 1 of 1 | Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
