"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { SiNaver, SiKakao } from "react-icons/si";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const handleLogin = (provider: string) => {
        signIn(provider, { callbackUrl: "/" });
    };

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden p-6">
            {/* Background Elements */}
            <div className="stars" style={{ "--duration": "3s", "--opacity": "0.7" } as any} />
            <div className="planet-earth opacity-50" />
            <div className="space-bg" />

            <div className="z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel rounded-3xl p-8 md:p-10 space-y-8"
                >
                    <div className="text-center space-y-2">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            메인으로 돌아가기
                        </Link>
                        <h1 className="text-3xl font-bold text-white">로그인</h1>
                        <p className="text-slate-400">소셜 계정으로 간편하게 시작하세요</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => handleLogin("google")}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-slate-900 rounded-xl font-medium hover:bg-slate-100 transition-colors"
                        >
                            <FcGoogle className="w-5 h-5" />
                            Google로 계속하기
                        </button>

                        <button
                            onClick={() => handleLogin("naver")}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#03C75A] text-white rounded-xl font-medium hover:bg-[#02b351] transition-colors"
                        >
                            <SiNaver className="w-4 h-4" />
                            네이버로 계속하기
                        </button>

                        <button
                            onClick={() => handleLogin("kakao")}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#FEE500] text-[#3c1e1e] rounded-xl font-medium hover:bg-[#fdd835] transition-colors"
                        >
                            <SiKakao className="w-5 h-5" />
                            카카오로 계속하기
                        </button>
                    </div>

                    <div className="text-center text-xs text-slate-500">
                        로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
