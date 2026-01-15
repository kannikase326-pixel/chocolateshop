'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

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

    if (error) {
      console.log(error)
      return
    }

    setProducts(data || [])
  }

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>🍫 Chocolate Shop</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.8 }}>สินค้าช็อกโกแลตทั้งหมด</p>
        </div>

        <a
          href="/admin"
          style={{
            padding: '10px 14px',
            border: '1px solid #ddd',
            borderRadius: 10,
            textDecoration: 'none',
          }}
        >
          ไปหลังบ้าน (Admin)
        </a>
      </div>

      {/* Products grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginTop: 20,
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{ border: '1px solid #eee', borderRadius: 14, overflow: 'hidden' }}
          >
            {p.image_url ? (
              <img
                src={p.image_url}
                alt={p.name}
                style={{ width: '100%', height: 180, objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: 180, background: '#f3f3f3' }} />
            )}

            <div style={{ padding: 12 }}>
              <h3 style={{ margin: '0 0 6px' }}>{p.name}</h3>
              <p style={{ margin: 0, opacity: 0.8 }}>{p.description}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <b>{p.price} บาท</b>
                <span style={{ opacity: 0.8 }}>Stock: {p.stock}</span>
              </div>

              <div style={{ marginTop: 8, opacity: 0.7 }}>{p.category}</div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <p style={{ marginTop: 16, opacity: 0.8 }}>
          ยังไม่มีสินค้า — ไปเพิ่มที่หน้า Admin ได้เลย
        </p>
      )}
    </main>
  )
}
