import { prisma } from '../config/db.js'
import { AppError } from '../utils/errors.js'

export async function listWidgets(adminId: string) {
  return prisma.dashboardWidget.findMany({
    where: { adminId, isActive: true },
    orderBy: { position: 'asc' },
  })
}

export async function createWidget(adminId: string, input: {
  title: string; type: string; dataSource: string;
  config: string; position?: number; width?: number;
}) {
  return prisma.dashboardWidget.create({
    data: { adminId, ...input },
  })
}

export async function updateWidget(id: string, adminId: string, input: Record<string, unknown>) {
  const widget = await prisma.dashboardWidget.findFirst({ where: { id, adminId } })
  if (!widget) throw AppError.notFound('Widget not found')
  return prisma.dashboardWidget.update({ where: { id }, data: input as any })
}

export async function deleteWidget(id: string, adminId: string) {
  const widget = await prisma.dashboardWidget.findFirst({ where: { id, adminId } })
  if (!widget) throw AppError.notFound('Widget not found')
  return prisma.dashboardWidget.delete({ where: { id } })
}

export async function reorderWidgets(adminId: string, widgetIds: string[]) {
  for (let i = 0; i < widgetIds.length; i++) {
    await prisma.dashboardWidget.update({
      where: { id: widgetIds[i] },
      data: { position: i },
    })
  }
  return { success: true }
}
