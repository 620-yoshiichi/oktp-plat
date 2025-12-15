import React from 'react'
import {Calculator, Calendar, CreditCard, Settings, Smile, User} from 'lucide-react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@cm/shadcn/ui/command'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {toast} from 'react-toastify'
import {calcurateTax, payBackObjType} from '@app/(apps)/ucar/class/lib/tax/calcurateTax'

export default function InlineTaxCalucrator({row, children}) {
  const {toggleLoad} = useGlobal()
  return (
    <div
      onClick={async () => {
        if (confirm(`税金計算を行いますか？`)) {
          try {
            const res = calcurateTax({row})
            if (res.result) {
              const result = res.result as payBackObjType
              const {Total, Pref, TOYOPET} = result

              toggleLoad(async () => {
                const res2 = await doStandardPrisma(`ucar`, `update`, {
                  where: {
                    id: row.id,
                  },
                  data: {
                    petCount: TOYOPET.month,
                    petPrice: TOYOPET.price,
                    prefCount: Pref.month,
                    prefPrice: Pref.price,
                  },
                })

                toastByResult(res2)
              })
            }
          } catch (error) {
            console.warn(error) //////////
            toast.error(error.message)
          }
        }
      }}
    >
      {children}
    </div>
  )
}

export function CommandDemo() {
  return (
    <Command className="rounded-lg border shadow-md md:min-w-[450px]">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Smile />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem disabled>
            <Calculator />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
