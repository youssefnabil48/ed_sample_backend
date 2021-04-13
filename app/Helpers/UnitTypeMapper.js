'use strict';

class UnitTypeMapper{

  static map(status){
    this.obj = {
      'Test' : 'Test',
      'Presentation | Document' : 'Document',
      'Content' : 'Content/Video',
      'Survey': 'Survey',
      'Section': 'Section',
      'Web content': 'Video',
      'Instructor-led training': 'Live Session'
    };
    return this.obj[status]? this.obj[status] : status;
  }

}

module.exports = UnitTypeMapper;
