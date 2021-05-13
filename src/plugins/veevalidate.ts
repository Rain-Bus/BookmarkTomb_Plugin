import {extend} from "vee-validate"
import {email, required, max, min, integer, max_value, min_value} from 'vee-validate/dist/rules'


extend('required', {
    ...required,
    message: "This field can't be blank!"
})

extend('email', {
    ...email,
    message: "The email is invalid!"
})

extend("beginWithChar", {
    validate: value => new RegExp("^[a-zA-z].*$").test(value),
    message: "This field must begin with A-Z or a-z."
})

extend("accountChar", {
    validate: value => new RegExp("^(\\w|-)+$").test(value),
    message: "This field must use A-Z, a-z, _, -."
})

extend("passwordChar", {
    validate: value => new RegExp("^(\\w|-|@)+$").test(value),
    message: "This field must use A-Z, a-z, _,- , @."
})

extend("min", {
    ...min,
    message: "This field must have at least {length} characters."
})

extend("max", {
    ...max,
    message: "This field must have at most {length} characters."
})

extend("integer", {
    ...integer,
    message: "This field must be number."
})

extend("min_value", {
    ...min_value,
    message: "This field min value is {min}."
})

extend("max_value", {
    ...max_value,
    message: "This field max value is {max}."
})