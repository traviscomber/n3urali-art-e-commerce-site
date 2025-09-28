import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, Share2, Heart } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import Link from "next/link"

interface Product {
  id: string
  title: string
  description: string
  category: string
  price: number
  preview_image_url: string
  full_image_url: string
  download_url: string
  tags: string[]
  resolution: string
  file_size: string
  file_format: string
  is_featured: boolean
  created_at: string
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error || !product) {
    notFound()
  }

  // Get related products
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .eq("is_active", true)
    .neq("id", id)
    .limit(4)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/gallery" className="hover:text-foreground">
            Gallery
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.preview_image_url || "/placeholder.svg"}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
              {product.is_featured && (
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">Featured</Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="capitalize">
                  {product.category}
                </Badge>
                {product.is_featured && <Badge variant="secondary">Featured</Badge>}
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Price and Purchase */}
            <div className="space-y-4">
              <div className="text-4xl font-bold text-primary">${product.price}</div>
              <AddToCartButton product={product} />
            </div>

            <Separator />

            {/* Technical Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolution:</span>
                  <span className="font-medium">{product.resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Size:</span>
                  <span className="font-medium">{product.file_size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium">{product.file_format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium capitalize">{product.category}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Usage Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Commercial and personal use</p>
                <p>✓ Unlimited downloads for 1 year</p>
                <p>✓ High-resolution files included</p>
                <p>✓ No attribution required</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Related Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-video">
                      <Image
                        src={relatedProduct.preview_image_url || "/placeholder.svg"}
                        alt={relatedProduct.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1 mb-2">{relatedProduct.title}</h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs capitalize">
                          {relatedProduct.category}
                        </Badge>
                        <span className="font-bold text-primary">${relatedProduct.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
