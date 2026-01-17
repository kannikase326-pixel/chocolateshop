'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

function isNew(createdAt: string) {
  const created = new Date(createdAt)
  const now = new Date()
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 3
}

type Product = {
  id: string
  name: string
  description?: string | null
  price: number
  stock: number
  category?: string | null
  image_url?: string | null
  created_at?: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
      return
    }
    setProducts((data as Product[]) || [])
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fdecec',
        fontFamily: 'system-ui',
      }}
    >
      {/* ===== TOP RED HEADER ===== */}
      <header
        style={{
          background: '#7a0c1d',
          color: '#fff',
          padding: '26px 32px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 44,
                fontWeight: 900,
                letterSpacing: 0.5,
              }}
            >
              🍫 Chocolate Shop
            </h1>
            <p style={{ margin: '6px 0 0', opacity: 0.9 }}>
              ช็อกโกแลตพรีเมียม คัดพิเศษ
            </p>
          </div>

          <a
            href="/admin"
            style={{
              background: '#f4c430',
              color: '#7a0c1d',
              padding: '12px 18px',
              borderRadius: 14,
              fontWeight: 900,
              textDecoration: 'none',
              boxShadow: '0 6px 14px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            หลังบ้าน Admin
          </a>
        </div>
      </header>

      {/* ===== CONTENT WRAP ===== */}
      <div style={{ padding: 24 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* ===== PRODUCTS ===== */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {products.map((p) => (
              <div
                key={p.id}
                style={{
                  borderRadius: 18,
                  overflow: 'hidden',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.10)',
                  background: '#fff',
                  position: 'relative',
                  border: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                {/* IMAGE */}
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    style={{ width: '100%', height: 210, objectFit: 'cover' }}
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div style={{ width: '100%', height: 210, background: '#f3f3f3' }} />
                )}

                {/* BADGES */}
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    display: 'flex',
                    gap: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  {p.stock === 0 && badge('OUT OF STOCK', '#777')}
                  {p.stock > 0 && p.price <= 120 && badge('SALE', '#b0122a')}
                  {p.created_at && isNew(p.created_at) && badge('NEW', '#0b7f3a')}
                </div>

                {/* CONTENT */}
                <div style={{ padding: 16 }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 900 }}>
                    {p.name}
                  </h3>
                  <p style={{ margin: 0, opacity: 0.75 }}>
                    {p.description || '—'}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: 12,
                      alignItems: 'center',
                    }}
                  >
                    <b style={{ fontSize: 18 }}>{p.price} บาท</b>
                    <span style={{ opacity: 0.7 }}>Stock: {p.stock}</span>
                  </div>

                  {/* BUY BUTTON (ไว้ก่อน ยังไม่ผูก orders) */}
                  <button
                    disabled={p.stock === 0}
                    style={{
                      marginTop: 14,
                      width: '100%',
                      padding: '11px 0',
                      borderRadius: 12,
                      border: 'none',
                      fontWeight: 900,
                      cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                      background: p.stock === 0 ? '#ddd' : '#7a0c1d',
                      color: '#fff',
                      boxShadow: '0 10px 16px rgba(122,12,29,0.18)',
                    }}
                    onClick={() => alert('กดสั่งซื้อแล้ว ✅ (เดี๋ยวค่อยต่อ orders)')}
                  >
                    {p.stock === 0 ? 'สินค้าหมด' : 'Buy Now'}
                  </button>

                  {p.category && (
                    <div style={{ marginTop: 10, opacity: 0.65, fontSize: 12 }}>
                      หมวด: {p.category}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <p style={{ marginTop: 20, opacity: 0.75 }}>
              ยังไม่มีสินค้า — ไปเพิ่มที่หน้า Admin ได้เลย
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

function badge(text: string, color: string) {
  return (
    <span
      style={{
        background: color,
        color: '#fff',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        boxShadow: '0 6px 12px rgba(0,0,0,0.12)',
      }}
    >
      {text}
    </span>
  )
}
