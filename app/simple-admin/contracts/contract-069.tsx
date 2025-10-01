"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Printer } from "lucide-react"

export function Contract069() {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Create a text version of the contract
    const contractText = document.getElementById("contract-content")?.innerText || ""
    const blob = new Blob([contractText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "Contract-069-Labyrinth-Neuralia.txt"
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
            <h1 className="text-3xl font-bold mb-2">DIGITAL ASSET LICENSE AGREEMENT</h1>
            <p className="text-lg">Contract #069</p>
            <p className="text-sm text-slate-600 mt-2">Effective Date: January 10, 2025</p>
          </div>

          {/* Parties */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-slate-300 pb-2">PARTIES</h2>
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Provider:</p>
                <p className="ml-4">Neuralia (N3urali.art)</p>
                <p className="ml-4 text-sm text-slate-600">Online Blockchain Digital Asset Company</p>
                <p className="ml-4 text-sm text-slate-600">Operating via decentralized infrastructure</p>
              </div>
              <div>
                <p className="font-semibold">Client:</p>
                <p className="ml-4">Labyrinth</p>
                <p className="ml-4 text-sm text-slate-600">Location: Bali, Indonesia</p>
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

          {/* Article 1: Scope of Work */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-slate-300 pb-2">ARTICLE 1: SCOPE OF WORK</h2>
            <div className="space-y-2 ml-4">
              <p>
                <span className="font-semibold">1.1 Deliverables:</span> Provider shall deliver to Client fifty (50)
                digital images in 4K resolution format.
              </p>
              <p>
                <span className="font-semibold">1.2 Quality Standards:</span> All images shall be delivered in
                high-quality 4K resolution (3840 x 2160 pixels minimum) in industry-standard formats (PNG, JPG, or
                equivalent).
              </p>
              <p>
                <span className="font-semibold">1.3 Delivery Method:</span> Images shall be delivered via secure
                download link provided in real-time upon confirmation of payment.
              </p>
            </div>
          </section>

          {/* Article 2: License Grant */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-slate-300 pb-2">
              ARTICLE 2: LICENSE GRANT AND RESTRICTIONS
            </h2>
            <div className="space-y-2 ml-4">
              <p>
                <span className="font-semibold">2.1 License Type:</span> Provider grants Client a non-exclusive,
                perpetual license to use the delivered images subject to the restrictions set forth herein.
              </p>

              <p className="font-semibold mt-4">2.2 Permitted Uses:</p>
              <ul className="list-disc ml-8 space-y-1">
                <li>Client may use the images as part of their creative process and creation workflow</li>
                <li>Client may incorporate the images into derivative works and creative projects</li>
                <li>Client may modify, edit, and transform the images for use in their projects</li>
              </ul>

              <p className="font-semibold mt-4">2.3 Prohibited Uses:</p>
              <ul className="list-disc ml-8 space-y-1">
                <li>Client shall NOT redistribute, resell, or transfer the original images to any third party</li>
                <li>Client shall NOT sell the images as separate, standalone files</li>
                <li>Client shall NOT sublicense the images to other parties</li>
                <li>Client shall NOT use the images in any manner that violates applicable laws or regulations</li>
              </ul>

              <p>
                <span className="font-semibold">2.4 Completion of Work:</span> Provider's obligations under this
                Agreement shall be deemed complete upon Client's receipt of the download link and successful download of
                all fifty (50) images.
              </p>
            </div>
          </section>

          {/* Article 3: Payment Terms */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-slate-300 pb-2">ARTICLE 3: PAYMENT TERMS</h2>
            <div className="space-y-2 ml-4">
              <p>
                <span className="font-semibold">3.1 Total Contract Value:</span> Three Thousand United States Dollars
                (USD $3,000.00)
              </p>

              <p>
                <span className="font-semibold">3.2 Payment Structure:</span>
              </p>
              <ul className="list-disc ml-8 space-y-1">
                <li>Gross Amount: USD $3,000.00</li>
                <li>Commission (Labyrinth): 15% (USD $450.00)</li>
                <li>Net Amount to Provider: USD $2,550.00</li>
              </ul>

              <p>
                <span className="font-semibold">3.3 Payment Method:</span> Payment shall be made via cryptocurrency on
                the TRC-20 Tron Network to the following address:
              </p>
              <div className="bg-slate-100 p-3 rounded font-mono text-sm break-all border border-slate-300 my-2">
                TJi1odaRdVm5e7yKLy3Uck3dwiUKDbmJ4a
              </div>

              <p>
                <span className="font-semibold">3.4 Payment Requirement:</span> One hundred percent (100%) of the total
                contract value must be received and confirmed on the blockchain before the download link will be
                provided to Client.
              </p>

              <p>
                <span className="font-semibold">3.5 Real-Time Processing:</span> Upon confirmation of payment on the
                blockchain, Provider shall immediately provide Client with the secure download link. Delivery is
                processed in real-time.
              </p>

              <p>
                <span className="font-semibold">3.6 Payment Verification:</span> Client is solely responsible for
                ensuring payment is sent to the correct address and on the correct network (TRC-20 Tron Network).
                Provider is not responsible for funds sent to incorrect addresses or on incorrect networks.
              </p>
            </div>
          </section>

          {/* Article 4: Intellectual Property */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-slate-300 pb-2">ARTICLE 4: INTELLECTUAL PROPERTY</h2>
            <div className="space-y-2 ml-4">
              <p>
                <span className="font-semibold">4.1 Ownership:</span> Provider retains all ownership rights, title, and
                interest in and to the original images. This Agreement grants only a license to use, not a transfer of
                ownership.
              </p>
              <p>
                <span className="font-semibold">4.2 Derivative Works:</span> Client shall own all rights to derivative
                works created by incorporating or transforming the licensed images, subject to Provider's retained
                rights in the original images.
              </p>
            </div>
          </section>

          {/* Article 5: Warranties and Disclaimers */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-slate-300 pb-2">ARTICLE 5: WARRANTIES AND DISCLAIMERS</h2>
            <div className="space-y-2 ml-4">
              <p>
                <span className="font-semibold">5.1 Provider Warranties:</span> Provider warrants that it has the right
                to license the images and that the images do not infringe upon any third-party intellectual property
                rights.
              </p>
              <p>
                <span className="font-semibold">5.2 Disclaimer:</span> THE IMAGES ARE PROVIDED "AS IS" WITHOUT WARRANTY
                OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY OR FITNESS
                FOR A PARTICULAR PURPOSE.
              </p>
            </div>
          </section>

          {/* Article 6: Limitation of Liability */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-slate-300 pb-2">ARTICLE 6: LIMITATION OF LIABILITY</h2>
            <div className="space-y-2 ml-4">
              <p>
                <span className="font-semibold">6.1 Maximum Liability:</span> Provider's total liability under this
                Agreement shall not exceed the total amount paid by Client under this Agreement (USD $3,000.00).
              </p>
              <p>
                <span className="font-semibold">6.2 Consequential Damages:</span> In no event shall either party be
                liable for any indirect, incidental, special, or consequential damages.
              </p>
            </div>
          </section>

          {/* Article 7: Term and Termination */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-slate-300 pb-2">ARTICLE 7: TERM AND TERMINATION</h2>
            <div className="space-y-2 ml-4">
              <p>
                <span className="font-semibold">7.1 Term:</span> This Agreement shall commence on the Effective Date and
                continue until all obligations are fulfilled.
              </p>
              <p>
                <span className="font-semibold">7.2 Survival:</span> The license grant, payment obligations,
                intellectual property provisions, and limitation of liability shall survive any termination of this
                Agreement.
              </p>
            </div>
          </section>

          {/* Article 8: Governing Law */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-slate-300 pb-2">
              ARTICLE 8: GOVERNING LAW AND DISPUTE RESOLUTION
            </h2>
            <div className="space-y-2 ml-4">
              <p>
                <span className="font-semibold">8.1 Governing Law:</span> This Agreement shall be governed by and
                construed in accordance with international commercial law principles and blockchain industry standards.
              </p>
              <p>
                <span className="font-semibold">8.2 Jurisdiction:</span> Given the international and decentralized
                nature of this transaction, the parties agree to resolve disputes through good faith negotiation and, if
                necessary, international arbitration.
              </p>
              <p>
                <span className="font-semibold">8.3 Blockchain Transactions:</span> The parties acknowledge that
                cryptocurrency transactions are irreversible and agree to exercise due diligence in all payment
                activities.
              </p>
            </div>
          </section>

          {/* Article 9: General Provisions */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-slate-300 pb-2">ARTICLE 9: GENERAL PROVISIONS</h2>
            <div className="space-y-2 ml-4">
              <p>
                <span className="font-semibold">9.1 Entire Agreement:</span> This Agreement constitutes the entire
                agreement between the parties and supersedes all prior negotiations, representations, or agreements.
              </p>
              <p>
                <span className="font-semibold">9.2 Amendments:</span> This Agreement may only be amended in writing
                signed by both parties.
              </p>
              <p>
                <span className="font-semibold">9.3 Severability:</span> If any provision is found invalid or
                unenforceable, the remaining provisions shall continue in full force and effect.
              </p>
              <p>
                <span className="font-semibold">9.4 Force Majeure:</span> Neither party shall be liable for failure to
                perform due to circumstances beyond their reasonable control, including but not limited to blockchain
                network failures or disruptions.
              </p>
            </div>
          </section>

          {/* Signatures */}
          <section className="space-y-6 mt-8 pt-6 border-t-2 border-slate-900">
            <h2 className="text-xl font-bold">ACCEPTANCE AND SIGNATURES</h2>

            <div className="grid grid-cols-2 gap-8 mt-8">
              <div className="space-y-4">
                <p className="font-semibold">PROVIDER:</p>
                <p>Neuralia (N3urali.art)</p>
                <div className="border-t border-slate-900 pt-2 mt-12">
                  <p className="text-sm">Authorized Signature</p>
                </div>
                <div className="border-t border-slate-900 pt-2 mt-4">
                  <p className="text-sm">Date</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-semibold">CLIENT:</p>
                <p>Labyrinth</p>
                <p className="text-sm text-slate-600">Bali, Indonesia</p>
                <div className="border-t border-slate-900 pt-2 mt-8">
                  <p className="text-sm">Authorized Signature</p>
                </div>
                <div className="border-t border-slate-900 pt-2 mt-4">
                  <p className="text-sm">Date</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-4 rounded border border-slate-300 mt-8">
              <p className="text-sm font-semibold mb-2">BLOCKCHAIN PAYMENT CONFIRMATION:</p>
              <p className="text-xs text-slate-600">
                By sending payment to the specified TRC-20 address, Client acknowledges acceptance of all terms and
                conditions set forth in this Agreement. The blockchain transaction serves as digital acceptance and
                confirmation of this contract.
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-300">
            <p>Contract #069 | Neuralia Digital Asset License Agreement</p>
            <p>Page 1 of 1 | Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
