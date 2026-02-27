"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function MiniVisualizer() {
    const array = [2, 1, 5, 1, 3, 2];
    const [left, setLeft] = useState(0);
    const [right, setRight] = useState(0);

    // Animate a simple sliding window that finds max sum of size 3
    useEffect(() => {
        let l = 0;
        let r = 0;

        const interval = setInterval(() => {
            if (r < array.length - 1) {
                if (r - l < 2) {
                    // grow window
                    r++;
                } else {
                    // slide window
                    l++;
                    r++;
                }
            } else {
                // reset
                l = 0;
                r = 0;
            }
            setLeft(l);
            setRight(r);
        }, 1200);

        return () => clearInterval(interval);
    }, [array.length]);

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl relative overflow-hidden">
            {/* Soft Glow Behind */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 opacity-50 pointer-events-none" />

            <div className="text-xs text-neutral-400 mb-4 tracking-widest uppercase font-semibold">
                Max Sum Subarray (k=3)
            </div>

            <div className="flex gap-2">
                {array.map((num, i) => {
                    const inWindow = i >= left && i <= right;
                    const isLeft = i === left;
                    const isRight = i === right;

                    return (
                        <div key={i} className="relative flex flex-col items-center">
                            {/* Pointer indicators */}
                            <div className="h-6 flex items-end justify-center mb-1">
                                {isLeft && (
                                    <motion.div
                                        layoutId="left-ptr"
                                        className="text-blue-400 text-xs font-bold"
                                    >
                                        L
                                    </motion.div>
                                )}
                                {isRight && !isLeft && (
                                    <motion.div
                                        layoutId="right-ptr"
                                        className="text-purple-400 text-xs font-bold"
                                    >
                                        R
                                    </motion.div>
                                )}
                                {isLeft && isRight && (
                                    <motion.div
                                        layoutId="both-ptr"
                                        className="text-white text-xs font-bold"
                                    >
                                        L,R
                                    </motion.div>
                                )}
                            </div>

                            {/* Array element */}
                            <motion.div
                                layout
                                animate={{
                                    scale: inWindow ? 1.1 : 1,
                                    backgroundColor: inWindow
                                        ? "rgba(110, 180, 255, 0.2)"
                                        : "rgba(255, 255, 255, 0.05)",
                                    borderColor: inWindow
                                        ? "rgba(110, 180, 255, 0.5)"
                                        : "rgba(255, 255, 255, 0.1)",
                                }}
                                className={`w-12 h-12 flex items-center justify-center text-lg font-mono rounded-xl border transition-colors ${inWindow ? "text-blue-200" : "text-neutral-500"
                                    }`}
                            >
                                {num}
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {/* Status calculation */}
            <div className="mt-6 h-6 flex items-center justify-center">
                <motion.div
                    key={`${left}-${right}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-mono text-neutral-300 bg-black/40 px-3 py-1 rounded-full border border-white/5"
                >
                    {right - left + 1 === 3 ? (
                        <span className="text-green-400">Sum = {array.slice(left, right + 1).reduce((a, b) => a + b, 0)}</span>
                    ) : (
                        <span>Adding elements...</span>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
