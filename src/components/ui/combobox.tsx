"use client"

import * as React from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxOption {
  value: string
  label: string
  description?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  buttonWidth?: string
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  buttonWidth = "w-[200px]",
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const selectedOption = options.find((option) => option.value === value)

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`${buttonWidth} justify-between ${!selectedOption && "text-muted-foreground"}`}
            disabled={disabled}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <span className="ml-2">▼</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <OptionList
            options={options}
            onSelect={(selectedValue) => {
              onValueChange(selectedValue)
              setOpen(false)
            }}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={emptyMessage}
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`${buttonWidth} justify-between ${!selectedOption && "text-muted-foreground"}`}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <span className="ml-2">▼</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <OptionList
            options={options}
            onSelect={(selectedValue) => {
              onValueChange(selectedValue)
              setOpen(false)
            }}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={emptyMessage}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function OptionList({
  options,
  onSelect,
  searchPlaceholder,
  emptyMessage,
}: {
  options: ComboboxOption[]
  onSelect: (value: string) => void
  searchPlaceholder: string
  emptyMessage: string
}) {
  return (
    <Command>
      <CommandInput placeholder={searchPlaceholder} />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              value={option.value}
              onSelect={onSelect}
            >
              <div className="flex flex-col">
                <span>{option.label}</span>
                {option.description && (
                  <span className="text-sm text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}