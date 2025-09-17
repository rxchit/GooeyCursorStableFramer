import * as React from "react"

export function GooeyCursorStableFull() {
    const numDots = 10
    const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0
    const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 0

    const [positions, setPositions] = React.useState(
        Array.from({ length: numDots }, () => ({ x: centerX, y: centerY }))
    )
    const mouse = React.useRef({ x: centerX, y: centerY })
    const prevMouse = React.useRef({ x: centerX, y: centerY })
    const [velocity, setVelocity] = React.useState(0)

    const headSize = 30
    const tailSize = 28

    React.useEffect(() => {
        const move = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY }
        }
        window.addEventListener("mousemove", move)
        document.body.style.cursor = "none"
        return () => window.removeEventListener("mousemove", move)
    }, [])

    React.useEffect(() => {
        let frame: number
        const animate = () => {
            const dx = mouse.current.x - prevMouse.current.x
            const dy = mouse.current.y - prevMouse.current.y
            const speed = Math.sqrt(dx * dx + dy * dy)
            setVelocity(speed)
            prevMouse.current = { ...mouse.current }

            setPositions((prev) => {
                const next = prev.map((p) => ({ ...p }))
                for (let i = 0; i < numDots; i++) {
                    const target = i === 0 ? mouse.current : next[i - 1]
                    // follow factor 0.3 to keep close
                    next[i].x += (target.x - next[i].x) * 0.3
                    next[i].y += (target.y - next[i].y) * 0.3
                }
                return next
            })

            frame = requestAnimationFrame(animate)
        }
        animate()
        return () => cancelAnimationFrame(frame)
    }, [numDots])

    return (
        <>
            <svg style={{ display: "none" }}>
                <filter id="goo">
                    <feGaussianBlur
                        in="SourceGraphic"
                        stdDeviation="10"
                        result="blur"
                    />
                    <feColorMatrix
                        in="blur"
                        mode="matrix"
                        values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 20 -10"
                        result="goo"
                    />
                    <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                </filter>
            </svg>

            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    mixBlendMode: "difference",
                    filter: "url(#goo)",
                    zIndex: 9999,
                }}
            >
                {positions.map((p, i) => {
                    // base taper
                    const baseSize = headSize * (1 - i * 0.05) // 5% shrink per blob
                    // scale head slightly with speed
                    const size =
                        i === 0
                            ? baseSize * (1 + Math.min(0.2, velocity / 300))
                            : baseSize

                    return (
                        <span
                            key={i}
                            style={{
                                position: "absolute",
                                left: p.x,
                                top: p.y,
                                width: size,
                                height: size,
                                borderRadius: "50%",
                                backgroundColor: "white",
                                transform: "translate(-50%,-50%)",
                            }}
                        />
                    )
                })}
            </div>
        </>
    )
}
