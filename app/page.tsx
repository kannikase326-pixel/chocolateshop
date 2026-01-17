'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Product = {
  id: string
  name: string
  description?: string | null
  category?: string | null
  price: number
  stock: number
  image_url?: string | null
  created_at?: string
}

function isNew(createdAt?: string) {
  if (!createdAt) return false
  const created = new Date(createdAt)
  const now = new Date()
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 3
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')

  // ✅ responsive แบบง่าย: เช็คความกว้างหน้าจอ
  const [isNarrow, setIsNarrow] = useState(false)
  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth <= 900)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert('โหลดสินค้าไม่สำเร็จ: ' + error.message)
      return
    }
    setProducts((data as Product[]) || [])
  }

  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      const c = (p.category || '').trim()
      if (c) set.add(c)
    })
    return ['all', ...Array.from(set)]
  }, [products])

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase()
    return products.filter((p) => {
      const matchCat =
        cat === 'all'
          ? true
          : (p.category || '').toLowerCase() === cat.toLowerCase()

      const hay = `${p.name || ''} ${p.description || ''} ${p.category || ''} ${
        p.price ?? ''
      } ${p.stock ?? ''}`.toLowerCase()

      const matchQ = keyword ? hay.includes(keyword) : true
      return matchCat && matchQ
    })
  }, [products, q, cat])

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fde9ea 0%, #fff 280px)',
        fontFamily: 'system-ui',
      }}
    >
      {/* TOP RED BAR */}
      <div
        style={{
          background: '#7a0c1d',
          color: '#fff',
          padding: '22px 0',
          boxShadow: '0 12px 26px rgba(0,0,0,0.14)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 30 }}>🍫</span>
              <h1 style={{ margin: 0, fontSize: 46, letterSpacing: -0.6 }}>
                ร้าน Chocolate Shop
              </h1>
            </div>
            <p style={{ margin: '6px 0 0', opacity: 0.9 }}>
              ช็อกโกแลตพรีเมียม คัดพิเศษ
            </p>
          </div>

          <a
            href="/admin"
            style={{
              padding: '12px 18px',
              borderRadius: 14,
              background: '#f6c63b',
              color: '#4a2a00',
              textDecoration: 'none',
              fontWeight: 900,
              boxShadow: '0 12px 18px rgba(0,0,0,0.18)',
              border: '1px solid rgba(255,255,255,0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            หน้าจัดการสินค้า
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '18px auto 0', padding: '0 22px' }}>
        {/* FILTER BAR */}
        <div
          style={{
            background: '#fff',
            borderRadius: 18,
            padding: 14,
            boxShadow: '0 10px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.05)',
            display: 'grid',
            gap: 12,
            position: 'relative',
            zIndex: 50,
            overflow: 'visible',
          }}
        >
          <div
            style={{
              display: 'grid',
              gap: 10,
              alignItems: 'center',

              // ✅ จุดแก้สำคัญ: ทำคอลัมน์ไม่ให้บีบจนทับกัน
              gridTemplateColumns: isNarrow
                ? '1fr'
                : 'minmax(260px, 1fr) minmax(180px, 260px) auto auto',
            }}
          >
            {/* SEARCH */}
            <div style={{ position: 'relative', zIndex: 55 }}>
              <span
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  opacity: 0.5,
                }}
              >
                🔎
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหา: ชื่อ / คำอธิบาย / หมวด / ราคา..."
                style={{ ...inputStyle, paddingLeft: 36, height: 44 }}
              />
            </div>

            {/* CATEGORY */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                flexWrap: 'wrap',
                position: 'relative',
                zIndex: 60,
                overflow: 'visible',
              }}
            >
              <b style={{ color: '#7a0c1d', whiteSpace: 'nowrap' }}>หมวดหมู่:</b>

              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                style={{
                  ...inputStyle,
                  height: 44,
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 60,
                  background: '#fff',
                  minWidth: 150, // ✅ กันโดนบีบ
                  maxWidth: 220,
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'ทั้งหมด' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* CLEAR */}
            <button
              onClick={() => {
                setQ('')
                setCat('all')
              }}
              style={{
                height: 44,
                padding: '0 14px',
                borderRadius: 12,
                border: '1px solid #eee',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}
            >
              ล้างตัวกรอง
            </button>

            {/* COUNT */}
            <div
              style={{
                textAlign: isNarrow ? 'left' : 'right',
                opacity: 0.7,
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              แสดง {filtered.length} / {products.length}
            </div>
          </div>
        </div>

        {/* PRODUCTS */}
        <div
          style={{
            marginTop: 18,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: 18,
            paddingBottom: 28,
          }}
        >
          {filtered.map((p) => (
            <div
              key={p.id}
              style={{
                borderRadius: 18,
                overflow: 'hidden',
                background: '#fff',
                boxShadow: '0 12px 26px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
                position: 'relative',
              }}
            >
              {/* BADGES */}
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  display: 'flex',
                  gap: 6,
                  zIndex: 2,
                }}
              >
                {p.stock === 0 && badge('OUT OF STOCK', '#777')}
                {p.stock > 0 && p.price <= 120 && badge('SALE', '#b0122a')}
                {isNew(p.created_at) && badge('NEW', '#0b7f3a')}
              </div>

              {/* IMAGE */}
              <div style={{ height: 190, background: '#f3f3f3' }}>
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.display =
                        'none'
                    }}
                  />
                ) : null}
              </div>

              <div style={{ padding: 16 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{p.name}</h3>
                <p style={{ margin: 0, opacity: 0.75, minHeight: 22 }}>
                  {p.description || '—'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    alignItems: 'center',
                  }}
                >
                  <b style={{ fontSize: 18 }}>{p.price} บาท</b>
                  <span style={{ opacity: 0.7 }}>Stock: {p.stock}</span>
                </div>

                <div style={{ marginTop: 8, opacity: 0.65, fontSize: 12 }}>
                  หมวด: <b>{p.category || '—'}</b>
                </div>

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
                    marginTop: 12,
                    width: '100%',
                    padding: '10px 0',
                    borderRadius: 12,
                    border: 'none',
                    fontWeight: 900,
                    cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                    background:
                      p.stock === 0
                        ? '#ddd'
                        : 'linear-gradient(135deg, #a4161a, #7a0c1d)',
                    color: '#fff',
                    boxShadow: '0 12px 18px rgba(122,12,29,0.18)',
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
        fontWeight: 900,
      }}
    >
      {text}
    </span>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 42,
  borderRadius: 12,
  border: '1px solid #e9e6e6',
  padding: '0 12px',
  outline: 'none',
  background: '#fff',
}
