"use client";

import Image from "next/image";
import logoSMC from "@/assets/logo_smc.png";
import Link from "next/link";

export default function Header() {
    return (
        <header className="bg-gray-100 text-black">
            <div className="bg-white shadow-md rounded-lg w-full min-h-full flex flex-row items-center justify-between px-6 md:px-36 py-4">
                <div className="flex items-center space-x-4 justify-between w-full">
                    <div>
                        <Link href="#" onClick={() => window.location.reload()}>
                            <h1 className="text-2xl md:text-3xl font-bold text-blue-600">Sorteio Editais</h1>
                        </Link>
                    </div>
                    <div>
                        <Link href="https://capital.sp.gov.br/web/cultura">
                            <Image
                                alt="Logo da SMC"
                                src={logoSMC}
                                quality={100}
                                className="object-contain w-40 md:w-52 h-auto"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}