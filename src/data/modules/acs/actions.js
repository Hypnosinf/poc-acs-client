export default {
	setToken:({commit}, value) => {
		commit('SET_TOKEN', value)
		console.log("SET_TOKEN", value);
	}
}