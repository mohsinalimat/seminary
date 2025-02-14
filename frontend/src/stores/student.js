import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createResource } from 'frappe-ui';

export const studentStore = defineStore('seminary-student', () => {

	const studentInfo = ref({})
	const currentProgram = ref({})
	

	const student = createResource({
		url: 'seminary.seminary.api.get_student_info',
		onSuccess(info) {
			if (!info) {
				window.location.href = "/app"
			}
			currentProgram.value = info.current_program 
			// remove current_program from info
			delete info.current_program
			studentInfo.value = info
		},
		onError(err) {
			console.error(err)
		}
	})

	// const s = createDocumentResource({
	// 	doctype:"Student",
	// 	whitelist: {
	// 		'get_student_info': get_student_info
	// 	}
	// })

	function getStudentInfo(){
		return studentInfo
	}
	function getCurrentProgram(){
		return currentProgram
	}



	return { student, studentInfo, currentProgram , getStudentInfo, getCurrentProgram }
})
