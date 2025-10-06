"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

function useMergedRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return React.useCallback(
    (node: T) => {
      for (const ref of refs) {
        if (!ref) continue
        if (typeof ref === "function") ref(node)
        else (ref as React.MutableRefObject<T | null>).current = node
      }
    },
    [refs],
  )
}

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const mergedRef = useMergedRefs(ref, rootRef)
  const [clipPath, setClipPath] = React.useState<string>("inset(0 0 100% 0 999px)")

  const updateClip = React.useCallback(() => {
    const root = rootRef.current
    if (!root) return

    const active = root.querySelector<HTMLElement>('[data-state="on"], [aria-pressed="true"]')
    const rootRect = root.getBoundingClientRect()

    if (!active) {
      // Hide pill when nothing selected
      setClipPath("inset(0 0 100% 0 999px)")
      return
    }

    const rect = active.getBoundingClientRect()
    const pad = 4

    const top = Math.max(0, rect.top - rootRect.top - pad)
    const left = Math.max(0, rect.left - rootRect.left - pad)
    const bottom = Math.max(0, rootRect.bottom - rect.bottom - pad)
    const right = Math.max(0, rootRect.right - rect.right - pad)

    setClipPath(`inset(${top}px ${right}px ${bottom}px ${left}px round 999px)`) 
  }, [])

  React.useEffect(() => {
    updateClip()

    const handle = () => updateClip()
    window.addEventListener("resize", handle)
    rootRef.current?.addEventListener("keydown", handle)
    rootRef.current?.addEventListener("pointerdown", handle)

    const mo = new MutationObserver(handle)
    if (rootRef.current) {
      mo.observe(rootRef.current, { attributes: true, subtree: true, attributeFilter: ["data-state", "aria-pressed", "class"] })
    }

    return () => {
      window.removeEventListener("resize", handle)
      rootRef.current?.removeEventListener("keydown", handle)
      rootRef.current?.removeEventListener("pointerdown", handle)
      mo.disconnect()
    }
  }, [updateClip])

  return (
    <ToggleGroupPrimitive.Root
      ref={mergedRef}
      className={cn("relative flex items-center justify-center gap-1", className)}
      {...props}
    >
      {/* Floating pill background using clip-path */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--toggle-pill-bg, rgba(0,0,0,0.08))",
          WebkitClipPath: clipPath,
          clipPath,
          transition: "clip-path 300ms cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <ToggleGroupContext.Provider value={{ variant, size }}>
        <div className="relative z-[1] contents">{children}</div>
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
})

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      <h2 className="font-[Instrument_Serif] text-2xl font-medium tracking-tight">{children}</h2>
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
