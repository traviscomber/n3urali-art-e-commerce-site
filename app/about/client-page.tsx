"use client"
import { useLanguage } from "@/lib/contexts/language-context"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, Lightbulb, Award } from "lucide-react"

export default function AboutClientPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6">
              {t("about.badge")}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              {t("about.title")}
              <span className="text-primary"> {t("about.titleHighlight")}</span>
              <br />
              {t("about.titleEnd")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">{t("about.subtitle")}</p>
          </div>

          {/* Key Takeaways Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                {t("about.whyChoose.badge")}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-balance">{t("about.whyChoose.title")}</h2>
              <p className="text-muted-foreground text-pretty">{t("about.whyChoose.subtitle")}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-semibold">{t("about.aiGenerated.title")}</h3>
                  </div>
                  <p className="text-muted-foreground">{t("about.aiGenerated.desc")}</p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-semibold">{t("about.professional.title")}</h3>
                  </div>
                  <p className="text-muted-foreground">{t("about.professional.desc")}</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold mb-4">{t("about.mission.title")}</h2>
              <p className="text-muted-foreground mb-6">{t("about.mission.p1")}</p>
              <p className="text-muted-foreground">{t("about.mission.p2")}</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">{t("about.offer.title")}</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  {t("about.offer.item1")}
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  {t("about.offer.item2")}
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  {t("about.offer.item3")}
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  {t("about.offer.item4")}
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  {t("about.offer.item5")}
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">{t("about.technology.title")}</h2>
            <p className="text-center text-muted-foreground mb-8">{t("about.technology.subtitle")}</p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t("about.technology.ai.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("about.technology.ai.desc")}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t("about.technology.capture.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("about.technology.capture.desc")}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t("about.technology.qa.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("about.technology.qa.desc")}</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                {t("about.faq.badge")}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-balance">
                {t("about.faq.title")}
                <span className="text-primary block">{t("about.faq.titleHighlight")}</span>
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">{t("about.faq.subtitle")}</p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="company-background" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">{t("about.faq1.q")}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{t("about.faq1.a")}</AccordionContent>
              </AccordionItem>

              <AccordionItem value="ai-vs-traditional" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">{t("about.faq2.q")}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{t("about.faq2.a")}</AccordionContent>
              </AccordionItem>

              <AccordionItem value="quality-standards" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">{t("about.faq3.q")}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{t("about.faq3.a")}</AccordionContent>
              </AccordionItem>

              <AccordionItem value="custom-projects" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">{t("about.faq4.q")}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{t("about.faq4.a")}</AccordionContent>
              </AccordionItem>

              <AccordionItem value="technology-pipeline" className="bg-card rounded-lg px-6">
                <AccordionTrigger className="text-left">{t("about.faq5.q")}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{t("about.faq5.a")}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{t("about.ready.title")}</h2>
            <p className="text-muted-foreground mb-8">{t("about.ready.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/gallery"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                {t("about.ready.browse")}
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
              >
                {t("about.ready.contact")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
