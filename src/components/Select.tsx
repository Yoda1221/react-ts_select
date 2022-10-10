import { useEffect, useRef, useState } from "react"
import styles from "../css/select.module.css"

export type Option = {
    label: string,
    value: string | number
}
type singleSelectProps = {
    multiple?: false,
    value?: Option,
    onChange: (value: Option | undefined) => void
}
type multipleSelectProps = {
    multiple: true,
    value: Option[],
    onChange: (value: Option[]) => void
}
type SelectProps = {
    options: Option[],
} & (singleSelectProps | multipleSelectProps)

const Select = ({multiple, value, onChange, options}: SelectProps) => {
    const containreRef = useRef<HTMLDivElement>(null)
    const [isOpen, setisOpen] = useState(false)
    const [highligtedIndex, setHighligtedIndex] = useState(0)

    function clearOptions() {
        multiple ? onChange([]) : onChange(undefined)
    }
    function selectOption(option: Option) {
        if (multiple) {
            if (value.includes(option)) onChange(value.filter(opt => opt !== option))
            else onChange([...value, option])
        } else {
            if (option !== value) onChange(option)
        }
    }
    function isOptionSelected(option: Option) {
        return multiple ? value.includes(option) : option === value
    }

    useEffect(() => {
        if (isOpen) setHighligtedIndex(0)
    }, [isOpen])
    
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target !== containreRef.current) return
            switch (e.code) {
                case "Enter":
                case "Space":
                    setisOpen(prev => !prev)
                    if (isOpen) selectOption(options[highligtedIndex])
                    break
                case "ArrowUp":
                case "ArrowDown": {
                        if(!isOpen) {
                            setisOpen(true)
                            break
                        }
                        const newValue = highligtedIndex + (e.code === "ArrowDown" ? 1 : -1)
                        if (newValue >= 0 && newValue < options.length) {
                            setHighligtedIndex(newValue)
                        }
                    }
                    break
                case "Escape":
                    setisOpen(false)
                    break
            }
        }
        containreRef.current?.addEventListener("keydown", handler)
        return () => { containreRef.current?.removeEventListener("keydown", handler) }
    }, [isOpen, highligtedIndex, options])
    

    return (
        <div 
            ref={containreRef}
            tabIndex={0} 
            className={styles.container} 
            onBlur={() => setisOpen(false)}
            onClick={() => setisOpen(prev => !prev)}
        >
            <span className={styles.value} >{
                    multiple 
                    ? value.map(val => (
                        <button
                            key={val.value}
                            onClick={ e => {
                                e.stopPropagation()
                                selectOption(val)
                            }}
                            className={styles["option-badge"]}
                        >{val.label}
                            <span className={styles["remove-btn"]}>&times;</span>
                        </button>
                    )) 
                    : value?.label
                }
            </span>
            <button 
                onClick={(e) => {
                    e.stopPropagation()
                    clearOptions()
                }} 
                className={styles["clear-btn"]} 
            >&times;</button>
            <div className={styles.divider} />
            <div className={styles.caret} />
            <ul className={`${styles.options} ${isOpen ? styles.show : ""}`} >
                {options.map((option, i) => (
                    <li
                        onClick={(e) => {
                            e.stopPropagation()
                            selectOption(option)
                            setisOpen(false)
                        }} 
                        onMouseEnter={() => setHighligtedIndex(i)}
                        key={option.value} 
                        className={`${styles.option} 
                            ${isOptionSelected(option) ? styles.selected : ""} 
                            ${i === highligtedIndex? styles.highlighted : ""}
                        `} 
                    >
                        {option.label}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Select
