const Branches = use('App/Lib/LMS/TalentLms/branches');
const Categories = use('App/Lib/LMS/TalentLms/categories');
const Courses = use('App/Lib/LMS/TalentLms/courses');
const Groups = use('App/Lib/LMS/TalentLms/groups');
const System = use('App/Lib/LMS/TalentLms/system');
const Users = use('App/Lib/LMS/TalentLms/users');
const request = use('App/Lib/LMS/TalentLms/lib/request')


class TalentLMS {
    constructor(env) {
        this.hostname = env.getOrFail('TALENT_DOMAIN');
        this.token = env.getOrFail('TALENT_ACCESS_KEY');
        this._request = request;

        this.Branches = new Branches(this.hostname, this.token);
        this.Categories = new Categories(this.hostname, this.token);
        this.Courses = new Courses(this.hostname, this.token);
        this.Groups = new Groups(this.hostname, this.token);
        this.System = new System(this.hostname, this.token);
        this.Users = new Users(this.hostname, this.token);
    }
}

module.exports = TalentLMS;
