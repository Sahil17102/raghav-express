'use client';
import { useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { SiteFooter, SiteNav } from '../site-chrome';
export default function Login(){const [note,setNote]=useState('');return <><SiteNav/><section className="login-page"><div><p className="eyebrow dark-eyebrow"><span/> CUSTOMER PORTAL</p><h1>Welcome<br/>back.</h1><p>Access your Raghav Express shipment and dispatch workspace.</p></div><form onSubmit={e=>{e.preventDefault();setNote('Demo portal: your login request has been received.')}}><LockKeyhole/><h2>Log in to your account</h2><label>Email address<input type="email" required placeholder="you@company.com"/></label><label>Password<input type="password" required placeholder="••••••••"/></label><button>Log In <ArrowRight size={17}/></button><output>{note}</output><a href="/contact">Need an account? Contact our team</a></form></section><SiteFooter/></>}
