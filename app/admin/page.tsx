'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([])

  // form state
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*')
    setProducts(data || [])
  }

  async function addProduct() {
    if (!name || !price || !stock) {
      alert('กรอกข้อมูลให้ครบ')
      return
    }

    const { error } = await supabase.from('products').insert([
      {
        name,
        price: Number(price),
        stock: Number(stock),
        image_url: imageUrl,
      },
    ])

    if (error) {
      alert(error.message)
    } else {
      alert('เพิ่มสินค้าแล้ว ✅')
      setName('')
      setPrice('')
      setStock('')
      setImageUrl('')
      loadProducts()
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('ลบสินค้านี้ใช่ไหม')) return
    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  return (
    <main style={page}>
      {/* HEADER */}
      <header style={header}>
        <h1 style={{ margin: 0, color: '#7a0c1d' }}>
          🍫 Chocolate Shop — Admin
        </h1>
        <a href="/" style={backBtn}>← กลับหน้าเว็บ</a>
      </header>

      {/* ADD PRODUCT */}
      <section style={card}>
        <h2>➕ เพิ่มสินค้าใหม่</h2>

        <input placeholder="ชื่อสินค้า" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="ราคา" value={price} onChange={e => setPrice(e.target.value)} />
        <input placeholder="Stock" value={stock} onChange={e => setStock(e.target.value)} />
        <input placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />

        <button onClick={addProduct} style={mainBtn}>
          เพิ่มสินค้า
        </button>
      </section>

      {/* PRODUCT LIST */}
      <section>
        <h2>📦 รายการสินค้า</h2>

        <div style={grid}>
          {products.map((p) => (
            <div key={p.id} style={card}>
              <b>{p.name}</b>
              <p style={{ opacity: 0.7 }}>
                {p.price} บาท | Stock {p.stock}
              </p>

              <button
                style={{ ...mainBtn, background: '#999' }}
                onClick={() => deleteProduct(p.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

/* ===== styles ===== */
const page = {
  minHeight: '100vh',
  background: '#f8f5f5',
  padding: 32,
  fontFamily: 'system-ui',
}

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 24,
}

const backBtn = {
  padding: '10px 18px',
  borderRadius: 999,
  background: '#7a0c1d',
  color: '#fff',
  textDecoration: 'none',
  fontWeight: 600,
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: 20,
}

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 16,
  boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
}

const mainBtn = {
  marginTop: 8,
  padding: '10px 0',
  borderRadius: 10,
  border: 'none',
  background: '#7a0c1d',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
}
