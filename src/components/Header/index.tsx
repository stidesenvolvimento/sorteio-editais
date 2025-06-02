"use client";

import Image from "next/image";
import logoSMC from "@/assets/logo_smc_preto.png";
import logoSorteio from "@/assets/logo_sorteio.png";
import Link from "next/link";

export default function Header() {
    return (
        <header className="bg-white/55 bg-transparent-5 text-black">
            <div className="shadow-md rounded-lg w-full flex flex-row items-center justify-between px-6 md:px-36 py-4">
                <div className="flex items-center flex-col md:flex-row space-x-4 justify-between w-full">
                    <div>
                        <Link href="#" onClick={() => window.location.reload()}>
                            <Image
                                alt="Logo da SMC"
                                src={logoSorteio}
                                quality={100}
                                className="object-contain md:w-52 scale-[0.9]"
                            />
                        </Link>
                    </div>
                    <div>
                        <Link href="https://capital.sp.gov.br/web/cultura">
                            <Image
                                alt="Logo da SMC"
                                src={logoSMC}
                                quality={100}
                                className="object-contain md:w-52 md:scale-[2] scale-150"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}