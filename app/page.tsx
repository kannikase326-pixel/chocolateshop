'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

function isNew(createdAt: string) {
  const created = new Date(createdAt)
  const now = new Date()
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 3
}

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [q, setQ] = useState('') // search
  const [selectedCat, setSelectedCat] = useState('all') // category filter

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

  // รวมหมวดจากข้อมูล (ตัดซ้ำ)
  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const p of products) {
      const c = (p.category ?? '').toString().trim()
      if (c) set.add(c)
    }
    return ['all', ...Array.from(set)]
  }, [products])

  // filter + search
  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase()

    return products.filter((p) => {
      const cat = (p.category ?? '').toString().trim()
      const passCat = selectedCat === 'all' ? true : cat === selectedCat

      const hay = `${p.name ?? ''} ${p.description ?? ''} ${p.category ?? ''} ${p.price ?? ''}`.toLowerCase()
      const passQ = !text ? true : hay.includes(text)

      return passCat && passQ
    })
  }, [products, selectedCat, q])

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto', fontFamily: 'system-ui' }}>
      {/* ===== HEADER ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, color: '#7a0c1d' }}>🍫 Chocolate Shop</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.8 }}>ช็อกโกแลตพรีเมียม คัดพิเศษ</p>
        </div>

        <a
          href="/admin"
          style={{
            padding: '10px 16px',
            borderRadius: 14,
            background: '#f4c430',
            color: '#7a0c1d',
            textDecoration: 'none',
            fontWeight: 800,
            boxShadow: '0 10px 16px rgba(0,0,0,0.12)',
            whiteSpace: 'nowrap',
          }}
        >
          หลังบ้าน Admin
        </a>
      </div>

      {/* ===== FILTER BAR (NEW) ===== */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginBottom: 16,
          padding: 14,
          borderRadius: 16,
          background: '#fff',
          boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 520 }}>
          <span style={{ position: 'absolute', left: 12, top: 10, opacity: 0.55 }}>🔎</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหา: ชื่อ / คำอธิบาย / หมวด / ราคา..."
            style={{
              height: 42,
              width: '100%',
              borderRadius: 14,
              border: '1px solid rgba(0,0,0,0.10)',
              padding: '0 12px 0 36px',
              outline: 'none',
            }}
          />
        </div>

        {/* Category */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontWeight: 800, opacity: 0.75 }}>หมวดหมู่:</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            style={{
              height: 42,
              borderRadius: 14,
              border: '1px solid rgba(0,0,0,0.10)',
              padding: '0 12px',
              outline: 'none',
              fontWeight: 800,
              background: '#fff',
              cursor: 'pointer',
              minWidth: 180,
            }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'ทั้งหมด' : c}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setQ('')
              setSelectedCat('all')
            }}
            style={{
              height: 42,
              padding: '0 12px',
              borderRadius: 14,
              border: '1px solid rgba(0,0,0,0.10)',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            ล้างตัวกรอง
          </button>
        </div>

        {/* count */}
        <div style={{ fontWeight: 800, opacity: 0.75 }}>
          แสดง {filtered.length} / {products.length}
        </div>
      </div>

      {/* ===== PRODUCTS ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {filtered.map((p) => (
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
                style={{ width: '100%', height: 200, objectFit: 'cover' }}
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <div style={{ height: 200, background: '#f3f3f3' }} />
            )}

            {/* BADGES */}
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
              {p.stock === 0 && badge('OUT OF STOCK', '#777')}
              {p.stock > 0 && p.price <= 120 && badge('SALE', '#b0122a')}
              {p.created_at && isNew(p.created_at) && badge('NEW', '#0b7f3a')}
            </div>

            {/* CONTENT */}
            <div style={{ padding: 16 }}>
              <h3 style={{ margin: '0 0 6px' }}>{p.name}</h3>
              <p style={{ margin: 0, opacity: 0.75 }}>{p.description}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
                <b style={{ fontSize: 18 }}>{p.price} บาท</b>
                <span style={{ opacity: 0.7 }}>Stock: {p.stock}</span>
              </div>

              {/* category line */}
              {p.category ? (
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
                  หมวด: <b>{p.category}</b>
                </div>
              ) : null}

              {/* BUY BUTTON */}
              <button
                disabled={p.stock === 0}
                onClick={async () => {
                  const { error } = await supabase.from('orders').insert([
                    { product_id: p.id, product_name: p.name, price: p.price },
                  ])

                  if (error) alert('เกิดข้อผิดพลาด: ' + error.message)
                  else alert('สั่งซื้อสำเร็จ! 🎉')
                }}
                style={{
                  marginTop: 14,
                  width: '100%',
                  padding: '10px 0',
                  borderRadius: 10,
                  border: 'none',
                  fontWeight: 800,
                  cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                  background: p.stock === 0 ? '#ddd' : 'linear-gradient(135deg, #a4161a, #7a0c1d)',
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
        <p style={{ marginTop: 20, opacity: 0.7 }}>ยังไม่มีสินค้า — ไปเพิ่มที่หน้า Admin</p>
      )}

      {products.length > 0 && filtered.length === 0 && (
        <p style={{ marginTop: 20, opacity: 0.7 }}>ไม่พบสินค้าที่ตรงกับคำค้น/หมวดที่เลือก</p>
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
        fontWeight: 800,
      }}
    >
      {text}
    </span>
  )
}
