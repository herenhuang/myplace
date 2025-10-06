"use client";

import { ComponentProps, useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Flip from "gsap/Flip";

gsap.registerPlugin(Flip);

type FlipRevealItemProps = {
    flipKey: string;
} & ComponentProps<"div">;

export const FlipRevealItem = ({ flipKey, ...props }: FlipRevealItemProps) => {
    return <div data-flip={flipKey} {...props} />;
};

type FlipRevealProps = {
    keys: string[];
    showClass?: string;
    hideClass?: string;
} & ComponentProps<"div">;

export const FlipReveal = ({ keys, hideClass = "", showClass = "", ...props }: FlipRevealProps) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const isShow = (key: string | null) => !!key && (keys.includes("all") || keys.includes(key));

    useGSAP(
        () => {
            if (!wrapperRef.current) return;

            const items = gsap.utils.toArray<HTMLDivElement>(["[data-flip]"]);
            const state = Flip.getState(items);

            items.forEach((item) => {
                const key = item.getAttribute("data-flip");
                if (isShow(key)) {
                    item.classList.add(showClass);
                    item.classList.remove(hideClass);
                } else {
                    item.classList.remove(showClass);
                    item.classList.add(hideClass);
                }
            });

            Flip.from(state, {
                duration: 0.4,
                scale: true,
                ease: "power1.inOut",
                stagger: 0.05,
                absolute: true,
                onEnter: (elements) =>
                    gsap.fromTo(
                        elements,
                        { opacity: 0, scale: 0.9 },
                        {
                            opacity: 1,
                            scale: 1,
                            duration: 0.4,
                        },
                    ),
                onLeave: (elements) => gsap.to(elements, { opacity: 0, scale: 0.9, duration: 0.4 }),
            });
        },

        { scope: wrapperRef, dependencies: [keys] },
    );

    return <div {...props} ref={wrapperRef} />;
};
