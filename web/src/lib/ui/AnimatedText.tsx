"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AnimatedText() {
    const text = "seeing them move";
    const letters = text.split("");
    const [left, setLeft] = useState(0);
    const [right, setRight] = useState(0);

    // Animate a simple sliding window finding a word or target size
    useEffect(() => {
        let l = 0;
        let r = 0;

        const interval = setInterval(() => {
            if (r < letters.length - 1) {
                if (r - l < 5) { // window of size 6
                    r++;
                } else {
                    l++;
                    r++;
                }
            } else {
                l = 0;
                r = 0;
            }
            setLeft(l);
            setRight(r);
        }, 600); // Fast, playful speed

        return () => clearInterval(interval);
    }, [letters.length]);

    return (
        <span className="relative inline-flex flex-row items-center whitespace-pre text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400">
            {letters.map((char, i) => {
                const inWindow = i >= left && i <= right;
                const isLeft = i === left;
                const isRight = i === right;

                return (
                    <span key={i} className="relative inline-block">
                        {/* L pointer */}
                        {isLeft && (
                            <motion.span
                                layoutId="left-hero-ptr"
                                className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
                            >
                                <span className="text-blue-400 text-sm font-black font-mono shadow-sm bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 mb-1">
                                    L
                                </span>
                                <span className="w-0.5 h-3 bg-gradient-to-b from-blue-400 to-transparent" />
                            </motion.span>
                        )}

                        {/* R pointer */}
                        {isRight && !isLeft && (
                            <motion.span
                                layoutId="right-hero-ptr"
                                className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
                            >
                                <span className="text-orange-400 text-sm font-black font-mono shadow-sm bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20 mb-1">
                                    R
                                </span>
                                <span className="w-0.5 h-3 bg-gradient-to-b from-orange-400 to-transparent" />
                            </motion.span>
                        )}

                        {/* Combined L,R pointer */}
                        {isLeft && isRight && (
                            <motion.span
                                layoutId="both-hero-ptr"
                                className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
                            >
                                <span className="text-white text-sm font-black font-mono shadow-sm bg-white/10 px-2 py-0.5 rounded-md border border-white/20 mb-1 whitespace-nowrap">
                                    L,R
                                </span>
                                <span className="w-0.5 h-3 bg-gradient-to-b from-white to-transparent" />
                            </motion.span>
                        )}

                        {/* In-window highlight box */}
                        {inWindow && char !== " " && (
                            <motion.span
                                layoutId={`highlight-${i}`}
                                className="absolute inset-x-0 -bottom-1 top-2 bg-white/20 rounded z-[-1]"
                            />
                        )}

                        {/* The Character */}
                        <motion.span
                            animate={{
                                y: inWindow ? -4 : 0,
                                color: inWindow ? "#fff" : "rgba(255, 255, 255, 0.4)", // Fade unselected letters to 40% opacity
                                textShadow: inWindow ? "0 0 10px rgba(255,255,255,0.5)" : "none"
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={`inline-block relative z-10 font-bold ${char === " " ? "w-4" : ""}`}
                        >
                            {char}
                        </motion.span>
                    </span>
                );
            })}
        </span>
    );
}
