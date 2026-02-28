import type { AgentConfig, Role } from './types.js'

class AgentRegistry {
  private agents = new Map<string, AgentConfig>()

  register(config: AgentConfig): void {
    if (this.agents.has(config.id)) {
      console.warn(`[AgentRegistry] Agent "${config.id}" already registered, overwriting`)
    }
    this.agents.set(config.id, config)
    console.log(`[AgentRegistry] Registered agent: ${config.id}`)
  }

  get(id: string): AgentConfig | undefined {
    return this.agents.get(id)
  }

  listByRole(role: Role): AgentConfig[] {
    return Array.from(this.agents.values()).filter((a) => a.allowedRoles.includes(role))
  }

  listAll(): AgentConfig[] {
    return Array.from(this.agents.values())
  }
}

export const agentRegistry = new AgentRegistry()
