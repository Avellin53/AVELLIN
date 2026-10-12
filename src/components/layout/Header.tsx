"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import TopHeader from './TopHeader';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.cartItems || []);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <TopHeader />;
}

export { TopHeader };
