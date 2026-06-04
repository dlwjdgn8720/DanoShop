import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";

export default function QRModal({ qrUrl, amount, onClose }) {
    return (
        <div style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000
        }}>
        <div style={{
            background: "#fff", borderRadius: "16px",
            padding: "2rem", width: "320px", textAlign: "center"
        }}>
            {/* 헤더 */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
            <span style={{ fontSize:"16px", fontWeight:500 }}>카카오페이 QR 결제</span>
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:"20px" }}>✕</button>
            </div>

            {/* 카카오 배지 */}
            <div style={{ background:"#FEE500", borderRadius:"8px", padding:"0.75rem", marginBottom:"1.5rem" }}>
            <span style={{ fontWeight:500, color:"#3C1E1E" }}>💛 카카오페이로 결제</span>
            </div>

            {/* QR 코드 */}
            <div style={{ background:"#f9f9f9", borderRadius:"8px", padding:"1.5rem", marginBottom:"1rem" }}>
            <QRCodeSVG value={qrUrl} size={160} />
            </div>

            <p style={{ fontSize:"13px", color:"#888", margin:"0 0 0.5rem" }}>
            핸드폰 카카오페이 앱으로 QR을 스캔하세요
            </p>
            <p style={{ fontSize:"12px", color:"#aaa", margin:0 }}>
            결제금액: <strong style={{ color:"#222" }}>{amount.toLocaleString()}원</strong>
            </p>
        </div>
        </div>
    );
}
