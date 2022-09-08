import * as actionTypes from './actionTypes'

const execute400Handler = error => {
	return {
		type: actionTypes.HTTP_400_ERROR,
		error
	}
}
const execute403Handler = () => {
	return {
		type: actionTypes.HTTP_403_ERROR
	}
}

const execute404Handler = () => {
	return {
		type: actionTypes.HTTP_404_ERROR
	}
}
const execute422Handler = error => {
	return {
		type: actionTypes.HTTP_422_ERROR,
		error: error
	}
}

const execute500Handler = props => {
	return {
		type: actionTypes.HTTP_500_ERROR,
		props: props
	}
}

const executeOtherErrorHandler = error => {
	return {
		type: actionTypes.HTTP_OTHER_ERROR,
		error: error
	}
}

const handleHTTPError = error => {
	console.log(error)
	if (!error.response) {
		return executeOtherErrorHandler(error)
	}
	switch (error.response.status) {
		case 400:
			return execute400Handler(error)

		case 403:
			return execute403Handler()

		case 404:
			return execute404Handler()

		case 422:
			return execute422Handler(error)

		case 500:
			return execute500Handler()

		default:
			return executeOtherErrorHandler(error)
	}
}

export default handleHTTPError
