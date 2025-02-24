"use client"

import Image from "next/image";
import logoSMC from "@/assets/logo_smc.png";
import Link from "next/link";

export default function Header(){
    return(
        <header className="bg-gray-100 flex flex-col text-black">
            <div className="bg-white shadow-md rounded-lg w-full min-h-full flex items-center justify-between px-36">
                <div>
                    <Link href="#" onClick={() => window.location.reload()}>
                        <h1 className="text-3xl font-bold text-center text-blue-600">🎲 Sorteio Editais</h1>
                    </Link>
                </div>
                <div className="w-96 flex justify-end">
                    <Link href="https://capital.sp.gov.br/web/cultura">
                        <Image
                        alt="Logo da SMC"
                        src={logoSMC}
                        quality={100}
                        className="object-contain w-52 h-34"
                        />
                    </Link>
                </div>
            </div>
        </header>
    );
}