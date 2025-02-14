<template>
	<div v-if="tableData.rows.length > 0" class="px-5 py-4">
		<ListView :columns="tableData.columns" :rows="tableData.rows" :options="{
			selectable: false,
			showTooltip: false,
			onRowClick: () => { },
		}" row-key="id" v-if="tableData.rows.length > 0">
			<ListHeader>
				<ListHeaderItem v-for="column in tableData.columns" :key="column.key" :item="column" />
			</ListHeader>
			<ListRow v-for="row in tableData.rows" :key="row.id" :row="row" v-slot="{ column, item }">
				<ListRowItem :item="item" :align="column.align">
					<Badge v-if="column.key === 'status'" variant="subtle" :theme="row.status === 'Paid' ? (bg_color = 'green') : (bg_color = 'red')
						" size="md" :label="item" />
					<Button v-if="column.key === 'cta' && row.status === 'Paid'" @click="openInvoicePDF(row)"
						class="hover:bg-gray-900 hover:text-white" icon-left="download" label="Download Invoice" />

					<Button v-if="column.key === 'cta' &&
						(row.status === 'Unpaid' || row.status === 'Overdue')
						" @click="openModal(row)"
						class="hover:bg-gray-900 hover:text-white flex flex-column items-center justify-center"
						icon-left="credit-card" label="Pay Now" />
				</ListRowItem>
			</ListRow>
		</ListView>
		<FeesPaymentDialog v-if="currentRow" :row="currentRow" :student="studentInfo" v-model="showPaymentDialog"
			@success="success()" />
	</div>

	<div v-else>
		<MissingData message="No Fees found" />

	</div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import {
	ListView,
	ListHeader,
	ListHeaderItem,
	ListRow,
	ListRowItem,
	Badge,
	createResource,
	Toast,
	FeatherIcon,
} from 'frappe-ui'
import { reactive, ref } from 'vue'
import FeesPaymentDialog from '@/components/FeesPaymentDialog.vue'
import { studentStore } from '@/stores/student'
import MissingData from '@/components/MissingData.vue'
import { createToast } from '@/utils'

const { getStudentInfo } = studentStore()
let studentInfo = getStudentInfo().value

const feesResource = createResource({
	url: 'seminary.seminary.api.get_student_invoices',
	params: {
		student: studentInfo.name,
	},
	onSuccess: (response) => {
		response = response.sort((a, b) => {
			const statusOrder = { Overdue: 0, Unpaid: 1, Paid: 2 }

			const statusA = statusOrder[a.status]
			const statusB = statusOrder[b.status]

			if (statusA !== statusB) {
				return statusA - statusB
			}

		})
		tableData.rows = response
	},
	auto: true,
})

const tableData = reactive({
	rows: [],
	columns: [
		{
			label: 'Program',
			key: 'program',
			width: 1,
		},
		{
			label: 'Status',
			key: 'status',
			width: 1,
		},
		{
			label: 'Payment Date',
			key: 'payment_date',
			width: 1,
		},
		{
			label: 'Due Date',
			key: 'due_date',
			width: 1,
		},
		{
			label: 'Amount',
			key: 'amount',
			width: 1,
		},
		{
			label: 'Invoice',
			key: 'cta',
			width: 1,
		},
	],
})

const currentRow = ref(null)
const showPaymentDialog = ref(false)

const openInvoicePDF = (row) => {
	let url = `/api/method/frappe.utils.print_format.download_pdf?
		doctype=${encodeURIComponent('Sales Invoice')}
		&name=${encodeURIComponent(row.invoice)}
		&format=${encodeURIComponent('Standard')}
	`
	window.open(url, '_blank')
}

const openModal = (row) => {
	currentRow.value = row
	showPaymentDialog.value = true
}

const success = () => {
	feesResource.reload()
	createToast({
		title: 'Payment Successful',
		icon: 'check',
		iconClasses: 'text-green-600',
	})
}
</script>
