import { useGame } from '../state/useGame.js'
import { buildingDefs } from '../engine/mechanics.js'

function Button({ className = "", ...props }) {
  return (
    <button
      className={
        "border border-stroke bg-[#12192a] text-ink font-semibold rounded-xl px-3 py-2 transition hover:-translate-y-0.5 hover:bg-[#16223a] disabled:opacity-60 " +
        className
      }
      {...props}
    />
  )
}

export default function Actions() {
  const { addResource, buyBuilding, canAfford, isBuildingVisible, state } = useGame()
  const huts = state.buildings.scavengerHut?.count || 0
  const visibleHut = isBuildingVisible('scavengerHut')

  return (
    <div className="grid gap-3">
      {/* Manual action */}
      <div className="bg-[#12192a] border border-stroke rounded-xl p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Zbieraj ręcznie</div>
            <div className="text-xs text-muted">Przeszukaj ruiny i zbierz +1 złomu</div>
          </div>
          <Button onClick={() => addResource('scrap', 1)}>+1 złom</Button>
        </div>
      </div>

      {/* Hut */}
      {visibleHut && (
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold">
              {buildingDefs.scavengerHut.name} <span className="text-xs text-muted">(x{huts})</span>
            </div>
            <div className="text-xs text-muted">{buildingDefs.scavengerHut.description}</div>
            <div className="text-xs text-muted mt-1">
              Koszt: {buildingDefs.scavengerHut.cost.scrap} złomu • Produkcja: +0.2/s
            </div>
          </div>
          <Button onClick={() => buyBuilding('scavengerHut')} disabled={!canAfford('scavengerHut')}>
            Zbuduj
          </Button>
        </div>
      )}
    </div>
  )
}
