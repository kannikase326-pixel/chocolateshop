'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

function isNew(createdAt: string) {
  const created = new Date(createdAt)
  const now = new Date()
  const diffDays =
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 3
}

export default function Home() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setProducts(data || [])
  }

  return (
    <main
      style={{
        padding: 24,
        maxWidth: 1200,
        margin: '0 auto',
        fontFamily: 'system-ui',
      }}
    >
      {/* ===== HEADER ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: '#7a0c1d' }}>🍫 Chocolate Shop</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.8 }}>
            ช็อกโกแลตพรีเมียม คัดพิเศษ
          </p>
        </div>

        <a
          href="/admin"
          style={{
            padding: '10px 16px',
            borderRadius: 999,
            background: '#7a0c1d',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          หลังบ้าน Admin
        </a>
      </div>

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
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
              background: '#fff',
              position: 'relative',
            }}
          >
            {/* IMAGE */}
            {p.image_url ? (
              <img
                src={p.image_url}
                alt={p.name}
                style={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div style={{ height: 200, background: '#f3f3f3' }} />
            )}

            {/* BADGES */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                display: 'flex',
                gap: 6,
              }}
            >
              {p.stock === 0 && badge('OUT OF STOCK', '#777')}
              {p.stock > 0 && p.price <= 120 && badge('SALE', '#b0122a')}
              {p.created_at && isNew(p.created_at) && badge('NEW', '#0b7f3a')}
            </div>

            {/* CONTENT */}
            <div style={{ padding: 16 }}>
              <h3 style={{ margin: '0 0 6px' }}>{p.name}</h3>
              <p style={{ margin: 0, opacity: 0.75 }}>{p.description}</p>

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

              {/* BUY BUTTON */}
<button
  disabled={p.stock === 0}
  onClick={async () => {
    const { error } = await supabase.from('orders').insert([
      {
        product_id: p.id,
        product_name: p.name,
        price: p.price,
      },
    ])

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      alert('สั่งซื้อสำเร็จ! 🎉')
    }
  }}
  style={{
    marginTop: 14,
    width: '100%',
    padding: '10px 0',
    borderRadius: 10,
    border: 'none',
    fontWeight: 700,
    cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
    background:
      p.stock === 0
        ? '#ddd'
        : 'linear-gradient(135deg, #a4161a, #7a0c1d)',
    color: '#fff',
  }}
>
  {p.stock === 0 ? 'สินค้าหมด' : 'Buy Now'}
</button>

            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <p style={{ marginTop: 20, opacity: 0.7 }}>
          ยังไม่มีสินค้า — ไปเพิ่มที่หน้า Admin
        </p>
      )}
    </main>
  )
}

/* ===== Badge helper ===== */
function badge(text: string, color: string) {
  return (
    <span
      style={{
        background: color,
        color: '#fff',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {text}
    </span>
  )
}
