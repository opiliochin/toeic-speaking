/*
 * 기본 내장 문항 세트 (자체 제작).
 * 해커스·YBM 등 출판사 문항은 저작권 때문에 여기에 넣지 않았습니다.
 * 본인이 가진 자료는 화면의 "문항 세트 불러오기(JSON)"로 추가하세요. 형식은 README.md 참고.
 * Q3-4 사진은 photos.js (CC BY 2.0 사진, 출처는 TSM_PHOTO_CREDITS).
 */
(function () {
  var P = window.TSM_PHOTOS || {};
  window.BUILTIN_SETS = [
    {
      id: 'builtin-1',
      title: '자체 제작 모의고사 1회',
      q1: { text: 'Attention, shoppers. Thank you for visiting Greenfield Market. Today only, all fresh produce, bakery items, and dairy products are twenty percent off. Please note that our customer service desk will close early at six o\'clock this evening. If you need assistance, please speak with any staff member wearing a green apron. We appreciate your business and hope you enjoy your shopping.' },
      q2: { text: 'Are you looking for a comfortable place to work outside the office? Brightway Co-working Space offers private desks, high-speed internet, and fully equipped meeting rooms. Located just two minutes from Central Station, our facility is open twenty-four hours a day, seven days a week. Sign up this month, and receive your first week free. Visit our website or call us today to schedule a tour.' },
      q3: { image: P.cafe },
      q4: { image: P.meeting },
      q5_7: {
        starters: ["I use public transportation about five times a week. I usually take the subway to work.", "It usually takes me about thirty minutes to get to work. I usually take the bus.", "One thing that could be improved is the number of buses, because they are too crowded during rush hour."],
        context: 'Imagine that a Canadian marketing firm is doing research in your country. You have agreed to participate in a telephone interview about public transportation.',
        questions: [
          'How often do you use public transportation, and where do you usually go?',
          'How long does it usually take you to get to work or school, and how do you get there?',
          'What is one thing that could be improved about public transportation in your area? Why?'
        ]
      },
      q8_10: {
        models: ["The conference will be held at the Harbor View Hotel on Saturday, May 18. It starts at 9 a.m. with registration and breakfast.", "Actually, that's not correct. Lunch is included in the registration fee of 80 dollars, so you don't have to pay extra.", "Daniel Moore is leading two workshops. First, from 10:45 to 11:45 a.m., there is a workshop on effective team communication. Second, from 2:30 to 3:30 p.m., there is a workshop on building customer loyalty."],
        info: {
          title: 'Regional Business Leaders Conference',
          subtitle: 'Harbor View Hotel  |  Saturday, May 18',
          rows: [
            ['9:00 – 9:30 A.M.', 'Registration & Breakfast'],
            ['9:30 – 10:30 A.M.', 'Keynote Speech: The Future of Remote Work (Linda Park, CEO, NextStep Inc.)'],
            ['10:45 – 11:45 A.M.', 'Workshop: Effective Team Communication (Daniel Moore)'],
            ['12:00 – 1:00 P.M.', 'Lunch (Grand Ballroom)'],
            ['1:15 – 2:15 P.M.', 'Panel Discussion: Marketing on a Small Budget'],
            ['2:30 – 3:30 P.M.', 'Workshop: Building Customer Loyalty (Daniel Moore)']
          ],
          notes: ['Registration fee: $80 (includes breakfast and lunch)']
        },
        keys: [
          [['Harbor View', 'Harbour View'], ['9', 'nine']],
          [['included', 'include', 'includes', 'no extra', 'free'], ['80', 'eighty']],
          [['team communication'], ['customer loyalty'], ['10 45', 'ten forty five', 'ten forty-five'], ['2 30', 'two thirty']]
        ],
        intro: 'Hi, this is Mark. I\'m planning to attend the business leaders conference, but I lost my copy of the schedule. I hope you can answer a few questions for me.',
        questions: [
          'Where is the conference being held, and what time does it start?',
          'I heard that lunch costs extra. Is that right?',
          'Could you tell me about all the sessions that Daniel Moore is leading?'
        ]
      },
      q11: { text: 'Do you agree or disagree with the following statement? "It is better for employees to work from home than at the office." Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-2',
      title: '자체 제작 모의고사 2회',
      q1: { text: 'Welcome to this week\'s episode of Healthy Living Today. On today\'s program, we will talk about simple ways to improve your sleep, reduce stress, and stay active during busy workdays. Later in the show, nutrition expert Dr. Karen Lee will share easy recipes that you can prepare in under twenty minutes. But first, let\'s listen to some questions from our listeners.' },
      q2: { text: 'Thank you for calling Riverside Dental Clinic. Our office hours are Monday through Friday, from eight a.m. to six p.m., and Saturday mornings by appointment only. To schedule, change, or cancel an appointment, please press one. For billing questions, press two. If this is a dental emergency, please stay on the line, and the next available staff member will assist you.' },
      q3: { image: P.library },
      q4: { image: P.grocery },
      q5_7: {
        starters: ["Korean barbecue is very popular in my city, and I eat it about once a week.", "I think you should make a reservation about one week in advance, because popular restaurants are often fully booked.", "I recommend a small Italian restaurant near my office, because the pasta is delicious and the prices are reasonable."],
        context: 'Imagine that a friend from another country is going to visit your city. You are having a telephone conversation about restaurants.',
        questions: [
          'What kind of food is popular in your city, and how often do you eat it?',
          'How far in advance should I make a reservation at a popular restaurant in your city?',
          'Can you recommend a restaurant for me to visit? Why do you recommend it?'
        ]
      },
      q8_10: {
        models: ["The first interview starts at 9 a.m., and all of the interviews will take place in Room 302.", "I'm sorry, but that interview was cancelled. James Wilson, the accountant, was scheduled for 3 p.m., so that interview will not take place.", "There are two applicants for the sales manager position. First, Amy Chen, who currently works at Delta Tech, has an interview at 9 a.m. Second, Sofia Martinez from Orion Systems has an interview at 1:30 p.m."],
        info: {
          title: 'Hanson Electronics — Interview Schedule',
          subtitle: 'Thursday, October 10  |  Room 302',
          rows: [
            ['9:00 A.M.', 'Amy Chen — Sales Manager (current employer: Delta Tech)'],
            ['10:00 A.M.', 'Robert Kim — Marketing Assistant (current employer: Brightline Media)'],
            ['11:30 A.M.', 'Lunch with HR team'],
            ['1:30 P.M.', 'Sofia Martinez — Sales Manager (current employer: Orion Systems)'],
            ['3:00 P.M.', 'James Wilson — Accountant (CANCELLED)']
          ],
          notes: []
        },
        keys: [
          [['9', 'nine'], ['302', 'three o two', 'three zero two', 'three hundred two', '3 0 2']],
          [['cancel', 'canceled', 'cancelled']],
          [['Amy Chen', 'Amy'], ['Delta Tech', 'Delta'], ['Sofia Martinez', 'Sophia Martinez', 'Sofia', 'Sophia'], ['Orion'], ['1 30', 'one thirty']]
        ],
        intro: 'Hi, this is Laura from the HR department. I\'ll be interviewing applicants on Thursday, but I don\'t have the schedule with me. Could you help me with some information?',
        questions: [
          'What time does the first interview start, and where will the interviews take place?',
          'I heard that I\'m interviewing an accountant at three o\'clock. Is that correct?',
          'Could you tell me about the applicants for the sales manager position?'
        ]
      },
      q11: { text: 'Some people think that university students should have a part-time job. Others think that students should focus only on their studies. Which view do you agree with, and why? Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-3',
      title: '자체 제작 모의고사 3회',
      q1: { text: 'Good evening, and welcome to tonight\'s performance at the Riverside Theater. Before the show begins, please turn off your mobile phones and other electronic devices. Photography and video recording are not permitted during the performance. There will be a fifteen-minute intermission, during which snacks, drinks, and souvenirs will be available in the main lobby. Thank you, and enjoy the show.' },
      q2: { text: 'Thank you for shopping at Lakeside Furniture. This weekend only, we\'re offering special discounts on sofas, dining tables, and office chairs. Customers who spend more than five hundred dollars will receive free delivery within the city. Our design consultants are available every day to help you choose the perfect pieces for your home. Visit us on Maple Avenue, next to the public library.' },
      q3: { image: P.chef },
      q4: { image: P.barber },
      q5_7: {
        starters: ["The last time I got a haircut was about two weeks ago. I went to a hair salon near my home.", "I usually find out about a new hair salon from my friends or from online reviews.", "The most important thing to me when I choose a hair salon is the skill of the hairdresser, because I want a good haircut."],
        context: 'Imagine that a US marketing firm is doing research in your country. You have agreed to participate in a telephone interview about hair salons.',
        questions: [
          'When was the last time you got a haircut, and where did you go?',
          'How do you usually find out about a new hair salon?',
          'What is the most important thing to you when you choose a hair salon? Why?'
        ]
      },
      q8_10: {
        models: ["The spring session starts on April 7 and ends on May 26.", "Actually, you don't need to bring anything. All ingredients are included in the class fee.", "There are two classes on Saturdays. First, Baking for Beginners with Chef Maria Lopez is from 10 a.m. to 12 p.m., and it costs 90 dollars. Second, Korean Home Cooking with Chef Min Lee is from 1 to 3 p.m., and it costs 110 dollars."],
        info: {
          title: 'Westfield Community Center — Spring Cooking Classes',
          subtitle: 'April 7 – May 26',
          rows: [
            ['Mondays 6:00 – 8:00 P.M.', 'Italian Pasta Basics (Chef Maria Lopez) — $120'],
            ['Wednesdays 6:00 – 8:00 P.M.', 'Healthy Vegetarian Meals (Chef David Park) — $100'],
            ['Saturdays 10:00 A.M. – 12:00 P.M.', 'Baking for Beginners (Chef Maria Lopez) — $90'],
            ['Saturdays 1:00 – 3:00 P.M.', 'Korean Home Cooking (Chef Min Lee) — $110']
          ],
          notes: ['All ingredients are included in the class fee.', 'Register by April 1 and receive 10% off.']
        },
        keys: [
          [['April seven', 'April seventh', 'April 7th'], ['May twenty six', 'May twenty sixth', 'May 26th']],
          [['included', 'include', 'provided', 'provide']],
          [['baking'], ['Korean'], ['Maria Lopez', 'Maria'], ['Min Lee']]
        ],
        intro: 'Hello, I\'m interested in taking a cooking class at the community center this spring. I have a few questions.',
        questions: [
          'When does the spring session start, and when does it end?',
          'I heard that I need to bring my own ingredients. Is that right?',
          'I\'m only free on Saturdays. Could you tell me about the classes offered on Saturdays?'
        ]
      },
      q11: { text: 'Do you agree or disagree with the following statement? "It is important to try new foods when you travel to another country." Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-4',
      title: '자체 제작 모의고사 4회',
      q1: { text: 'Hello, this is Karen from Greenway Auto Repair. I\'m calling to let you know that your car is ready for pickup. We replaced the front brakes, changed the oil, and checked the tires. Our service center is open until seven o\'clock tonight, and from nine to five on Saturday. If you have any questions about the repairs, please give us a call. Thank you for choosing Greenway.' },
      q2: { text: 'Welcome aboard the City Lights Evening Bus Tour. Over the next two hours, we\'ll pass by some of the city\'s most famous landmarks, including the old harbor, the central market, and the historic clock tower. Feel free to take photos from the upper deck, but please remain seated while the bus is moving. Our first stop will be at Riverside Park in about twenty minutes.' },
      q3: { image: P.station },
      q4: { image: P.parktable },
      q5_7: {
        starters: ["I go to a park about twice a week, and I usually go with my family.", "When I go to a park, I usually take a walk or ride my bicycle.", "If a new park opened in my neighborhood, I would want it to have a walking trail, because walking is good for my health."],
        context: 'Imagine that you are talking on the telephone with a friend. You are talking about spending time outdoors.',
        questions: [
          'How often do you go to a park, and who do you usually go with?',
          'What do you usually do when you go to a park?',
          'If a new park opened in your neighborhood, what kind of facilities would you want it to have? Why?'
        ]
      },
      q8_10: {
        models: ["Your train leaves Central Station at 8:15 a.m. on Monday, and it arrives in Boston at 11:50 a.m.", "Actually, you'll be staying at the Parkside Hotel for two nights. Oceanview is the restaurant where you'll have dinner on Tuesday.", "On Tuesday, you have two plans. First, at 10 a.m., you will take a factory tour at Harper Industries. Then, at 6:30 p.m., you will have dinner with clients at the Oceanview Restaurant."],
        info: {
          title: 'Business Trip Itinerary',
          subtitle: 'Jason Reed, Sales Department',
          rows: [
            ['Mon, June 3', '8:15 A.M. Train departs Central Station for Boston (arrives 11:50 A.M.)'],
            ['Mon, June 3', '2:00 P.M. Meeting with Harper Industries (Harper office, Room 5)'],
            ['Tue, June 4', '10:00 A.M. Factory tour — Harper Industries'],
            ['Tue, June 4', '6:30 P.M. Dinner with clients — Oceanview Restaurant'],
            ['Wed, June 5', '9:40 A.M. Train departs Boston for Central Station']
          ],
          notes: ['Hotel: Parkside Hotel (2 nights)']
        },
        keys: [
          [['eight fifteen', '8 15'], ['eleven fifty', '11 50']],
          [['Parkside', 'Park side']],
          [['factory tour', 'factory'], ['Harper'], ['dinner'], ['Oceanview', 'Ocean View']]
        ],
        intro: 'Hi, this is Jason. I\'m leaving for my business trip next week, but I can\'t find my itinerary. Could you answer a few questions for me?',
        questions: [
          'What time does my train leave on Monday, and what time does it arrive?',
          'I\'ll be staying at the Oceanview Hotel, right?',
          'Could you tell me what I\'ll be doing on Tuesday?'
        ]
      },
      q11: { text: 'Which is better for a company: hiring experienced workers or hiring new graduates and training them? Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-5',
      title: '자체 제작 모의고사 5회',
      q1: { text: 'Good morning, this is Jenny Clark with your local weather update. Today will be sunny and warm, with temperatures reaching twenty-eight degrees by the afternoon. However, strong winds and heavy rain are expected to move into the area tomorrow evening. Drivers should be careful on the highways, and residents are advised to bring outdoor furniture inside. We\'ll have more updates throughout the day.' },
      q2: { text: 'Thank you all for coming to tonight\'s awards dinner. It is my great pleasure to introduce our guest speaker, Dr. Alan Brooks. Dr. Brooks has worked in medical research for over twenty years, and his recent study on sleep and memory has received international attention. Tonight, he will share his ideas about science, teamwork, and creativity. Please join me in welcoming Dr. Brooks.' },
      q3: { image: P.lab },
      q4: { image: P.outdoormarket },
      q5_7: {
        starters: ["I usually buy fruit and vegetables at a supermarket near my home, because it is close and the prices are good.", "I buy fresh fruit about twice a week, and I usually buy apples and bananas.", "I think it is better to buy vegetables at a traditional market, because the vegetables are fresher and cheaper."],
        context: 'Imagine that a British marketing firm is doing research in your country. You have agreed to participate in a telephone interview about buying fruit and vegetables.',
        questions: [
          'Where do you usually buy fruit and vegetables, and why do you shop there?',
          'How often do you buy fresh fruit, and what kind do you usually buy?',
          'Do you think it is better to buy vegetables at a traditional market or at a large supermarket? Why?'
        ]
      },
      q8_10: {
        models: ["The training will be held in Room 210 of the Science Building, and it starts at 9 a.m.", "Actually, you don't need to bring them. Lab coats and safety glasses will be provided.", "Dr. Peter Wong is leading two sessions in the morning. First, from 9:30 to 10:30, there is a lecture on handling chemicals safely. Then, from 10:45 to 11:45, there is a demonstration on using safety equipment."],
        info: {
          title: 'Lakeview University — Lab Safety Training',
          subtitle: 'Thursday, March 14  |  Science Building, Room 210',
          rows: [
            ['9:00 – 9:30 A.M.', 'Welcome & Introduction (Prof. Susan Green)'],
            ['9:30 – 10:30 A.M.', 'Lecture: Handling Chemicals Safely (Dr. Peter Wong)'],
            ['10:45 – 11:45 A.M.', 'Demonstration: Using Safety Equipment (Dr. Peter Wong)'],
            ['12:00 – 1:00 P.M.', 'Lunch (Student Cafeteria)'],
            ['1:00 – 2:00 P.M.', 'Lecture: Emergency Procedures (Prof. Susan Green)'],
            ['2:00 – 2:30 P.M.', 'Written Test']
          ],
          notes: ['Lab coats and safety glasses will be provided.']
        },
        keys: [
          [['210', 'two ten', 'Science Building'], ['nine']],
          [['provided', 'provide', 'don\'t need', 'do not need', 'no need']],
          [['chemicals'], ['safety equipment', 'equipment'], ['nine thirty'], ['ten forty five']]
        ],
        intro: 'Hello, this is Tom. I\'m a new lab assistant, and I\'m going to attend the safety training on Thursday. Could I ask you a few questions?',
        questions: [
          'Where is the training, and what time does it start?',
          'I need to bring my own safety glasses, right?',
          'Could you tell me about the sessions that Dr. Peter Wong is leading?'
        ]
      },
      q11: { text: 'Do you agree or disagree with the following statement? "Children should learn how to cook at school." Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-6',
      title: '자체 제작 모의고사 6회',
      q1: { text: 'Attention, all employees. The parking garage on the east side of the building will be closed for repairs starting next Monday. During this time, please use the visitor parking lot on Pine Street, the shuttle bus, or public transportation. The repairs are expected to take about two weeks. We apologize for any inconvenience, and we appreciate your patience and cooperation.' },
      q2: { text: 'Ride into spring with Velo Bicycle Center! We carry road bikes, mountain bikes, and electric bikes for riders of all ages. Our experienced mechanics offer fast repairs, safety checks, and custom fittings. Bring in your old bicycle this month, and get thirty percent off a new one. Velo Bicycle Center is located downtown, across from City Hall.' },
      q3: { image: P.bikeshop },
      q4: { image: P.officelaptops },
      q5_7: {
        starters: ["The last time I rode a bicycle was last weekend. I rode it along the river near my home.", "I would rather ride a bicycle with friends, because it is more fun to talk and ride together.", "I think my city is a good place for riding bicycles, because there are many bike lanes along the river."],
        context: 'Imagine that a Canadian marketing firm is doing research in your country. You have agreed to participate in a telephone interview about bicycles.',
        questions: [
          'When was the last time you rode a bicycle, and where did you ride it?',
          'Would you rather ride a bicycle alone or with friends? Why?',
          'Do you think your city is a good place for riding bicycles? Why or why not?'
        ]
      },
      q8_10: {
        models: ["The orientation is on Monday, September 9, and it will be held in Conference Room B.", "Actually, that session has been moved. The Q&A session with the CEO, Rachel Adams, will be on Tuesday at 10 a.m.", "Brian Hall, the HR manager, is leading two sessions. First, at 9:30 a.m., there is a session on the company's history and values. Second, at 1:30 p.m., there is an office tour."],
        info: {
          title: 'Nova Software — New Employee Orientation',
          subtitle: 'Monday, September 9  |  Conference Room B',
          rows: [
            ['9:00 A.M.', 'Welcome Speech — Rachel Adams, CEO'],
            ['9:30 A.M.', 'Company History & Values — Brian Hall, HR Manager'],
            ['10:30 A.M.', 'Computer & Email Setup — IT Team'],
            ['12:00 P.M.', 'Lunch with Team Leaders (Cafeteria)'],
            ['1:30 P.M.', 'Office Tour — Brian Hall'],
            ['2:30 P.M.', 'Q&A Session — Rachel Adams, CEO (moved to Tuesday, 10:00 A.M.)']
          ],
          notes: []
        },
        keys: [
          [['Monday'], ['Conference Room B', 'room B']],
          [['Tuesday'], ['ten']],
          [['history', 'values'], ['tour'], ['nine thirty'], ['one thirty']]
        ],
        intro: 'Hi, this is Kevin. I\'m starting work at Nova Software next week, and I\'d like to check some details about the orientation.',
        questions: [
          'What day is the orientation, and where will it be held?',
          'I heard there\'s a question-and-answer session with the CEO on Monday afternoon. Is that correct?',
          'Could you tell me about the sessions led by Brian Hall?'
        ]
      },
      q11: { text: 'Some people prefer to work in an open office where everyone shares one space. Others prefer to work in a private office. Which do you prefer, and why? Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-7',
      title: '자체 제작 모의고사 7회',
      q1: { text: 'Attention, passengers. The number fifteen bus to Lincoln Square has been delayed by about twenty minutes due to heavy traffic on Main Street. Passengers traveling to the airport may take the express bus from platform three instead. Please check the screens in the waiting area for updated departure times. We apologize for the delay, and thank you for traveling with Metro City Transit.' },
      q2: { text: 'Planning a party, a wedding, or a company event? Let Garden Table Catering take care of the food. We offer fresh salads, grilled meats, homemade desserts, and vegetarian options for groups of any size. Our professional staff will set up, serve, and clean up, so you can relax and enjoy your guests. Call us today for a free menu consultation.' },
      q3: { image: P.buffet },
      q4: { image: P.bus },
      q5_7: {
        starters: ["The last time I went to a party was last month. It was my friend's birthday party.", "I prefer having parties at home, because it is more comfortable and less expensive.", "If I were planning a birthday party for a friend, I would serve pizza and cake, because most people like them."],
        context: 'Imagine that an Australian marketing firm is doing research in your country. You have agreed to participate in a telephone interview about parties and celebrations.',
        questions: [
          'When was the last time you went to a party, and what was the occasion?',
          'Do you prefer having parties at home or at a restaurant? Why?',
          'If you were planning a birthday party for a friend, what kind of food would you serve? Why?'
        ]
      },
      q8_10: {
        models: ["The festival is on Saturday, July 20, and it will be held at Riverside Park.", "Actually, you don't need a ticket. Admission is free.", "There are three events on the main stage. First, the opening ceremony starts at 11 a.m. Then, at 1 p.m., there is a jazz concert by The Blue Notes. Finally, at 7 p.m., there is a rock concert by the City Lights Band."],
        info: {
          title: 'Riverside Summer Festival',
          subtitle: 'Saturday, July 20  |  Riverside Park',
          rows: [
            ['11:00 A.M.', 'Opening Ceremony (Main Stage)'],
            ['11:30 A.M. – 5:00 P.M.', 'International Food Fair (East Lawn)'],
            ['1:00 P.M.', 'Jazz Concert — The Blue Notes (Main Stage)'],
            ['3:00 P.M.', 'Children\'s Magic Show (Tent B)'],
            ['7:00 P.M.', 'Rock Concert — City Lights Band (Main Stage)'],
            ['9:00 P.M.', 'Fireworks (Riverside Bridge)']
          ],
          notes: ['Admission is free.', 'Free shuttle buses run from Central Station every 30 minutes.']
        },
        keys: [
          [['July twenty', 'July twentieth', 'July 20th'], ['Riverside Park']],
          [['free']],
          [['opening'], ['jazz'], ['rock']]
        ],
        intro: 'Hi, my name is Sarah. I\'m planning to go to the summer festival with my family. Could you give me some information?',
        questions: [
          'What date is the festival, and where will it be held?',
          'I heard that I have to buy a ticket to get in. Is that true?',
          'Could you tell me about the events that will take place on the main stage?'
        ]
      },
      q11: { text: 'Do you agree or disagree with the following statement? "It is better to eat lunch with coworkers than to eat alone." Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-8',
      title: '자체 제작 모의고사 8회',
      q1: { text: 'Welcome to the Grand Bay Hotel. We hope you enjoy your stay with us. Breakfast is served every morning from six thirty to ten o\'clock in the Harbor Room on the second floor. Our fitness center, swimming pool, and business lounge are open to all guests. If you need a taxi, a wake-up call, or restaurant recommendations, please contact the front desk at any time.' },
      q2: { text: 'Moving to a new home or office? Quick Move Services makes it easy. Our trained team will pack, load, and deliver your furniture and boxes safely and on time. We provide moving trucks of all sizes, as well as storage space for short or long periods. Book your move online before the end of the month, and receive a free set of packing boxes.' },
      q3: { image: P.hotellobby },
      q4: { image: P.movers },
      q5_7: {
        starters: ["The last time I stayed at a hotel was last summer. It was in Busan.", "I usually book a hotel room online, because it is fast and I can compare prices.", "When I choose a hotel, location is the most important to me, because I want to save time when I travel."],
        context: 'Imagine that a travel magazine is doing research in your country. You have agreed to participate in a telephone interview about hotels.',
        questions: [
          'When was the last time you stayed at a hotel, and where was it?',
          'How do you usually book a hotel room?',
          'When you choose a hotel, which is the most important to you: price, location, or service? Why?'
        ]
      },
      q8_10: {
        models: ["The sales training is in the Ocean Room, and it starts at 9 a.m.", "Actually, the retirement party is in the Garden Room, from 6 to 9 p.m.", "There are two events in the evening. First, Mr. James Cole's retirement party is in the Garden Room from 6 to 9 p.m., for 60 people. Second, the Kim family's anniversary dinner is in the Sky Lounge from 7 to 10 p.m., for 30 people."],
        info: {
          title: 'Grand Bay Hotel — Event Room Reservations',
          subtitle: 'Friday, November 8',
          rows: [
            ['Ocean Room', '9:00 A.M. – 12:00 P.M.', 'Sales Training — Sun Electronics (40 people)'],
            ['Ocean Room', '2:00 – 5:00 P.M.', 'Job Fair — City College (120 people)'],
            ['Garden Room', '10:00 A.M. – 1:00 P.M.', 'Book Club Meeting (15 people)'],
            ['Garden Room', '6:00 – 9:00 P.M.', 'Retirement Party — Mr. James Cole (60 people)'],
            ['Sky Lounge', '7:00 – 10:00 P.M.', 'Anniversary Dinner — Kim family (30 people)']
          ],
          notes: []
        },
        keys: [
          [['Ocean Room', 'ocean'], ['nine']],
          [['Garden Room', 'garden']],
          [['retirement'], ['anniversary'], ['six'], ['seven']]
        ],
        intro: 'Hi, this is Linda from the events office. I\'m out of the office today, so I don\'t have the reservation list for Friday. Could you check a few things for me?',
        questions: [
          'Which room is the sales training in, and what time does it start?',
          'The retirement party is in the Sky Lounge, isn\'t it?',
          'Could you tell me about the events that will take place in the evening?'
        ]
      },
      q11: { text: 'Some people prefer to travel with a tour group. Others prefer to plan their own trips. Which do you prefer, and why? Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-9',
      title: '자체 제작 모의고사 9회',
      q1: { text: 'Attention, library visitors. The library will be closing in fifteen minutes. Please bring any books, magazines, or DVDs you would like to borrow to the front desk now. Computers in the study area will shut down automatically at eight fifty-five. Tomorrow, the library will open at ten o\'clock instead of nine because of a staff meeting. Thank you for visiting the Oakwood Public Library.' },
      q2: { text: 'Looking for a cozy place to relax after work? Try Blue Door Café, now open on Elm Street. We serve freshly roasted coffee, homemade sandwiches, and delicious cakes baked every morning. Enjoy live acoustic music every Friday night, or read a book by our warm fireplace. Show this advertisement at the counter, and get a free cookie with any drink.' },
      q3: { image: P.librarydesk },
      q4: { image: P.cafetable },
      q5_7: {
        starters: ["I go to a library about once a month, and I usually borrow books there.", "I prefer reading paper books, because they are easier on my eyes.", "I would visit a library more often if it were open later at night, because I am busy during the day."],
        context: 'Imagine that a US marketing firm is doing research in your country. You have agreed to participate in a telephone interview about libraries.',
        questions: [
          'How often do you go to a library, and what do you usually do there?',
          'Do you prefer reading paper books or electronic books? Why?',
          'What would make you want to visit a library more often? Why?'
        ]
      },
      q8_10: {
        models: ["The author talk is on Wednesday, October 9, at 7 p.m., and it will be held in the Main Hall.", "Actually, you don't need to pay. All events are free.", "There are two events that require registration. First, the Computer Basics Workshop is on Saturday, October 12, at 2 p.m. Second, the Job Interview Skills Workshop is on Saturday, October 19, at 2 p.m. Both are in the Computer Lab, and you can register by calling 555-0192."],
        info: {
          title: 'Oakwood Public Library — October Events',
          subtitle: 'All events are free',
          rows: [
            ['Oct. 5 (Sat.) 10:00 A.M.', 'Story Time for Children (ages 3–6) — Children\'s Room'],
            ['Oct. 9 (Wed.) 7:00 P.M.', 'Author Talk: Emily Ross, "The Silent Harbor" — Main Hall'],
            ['Oct. 12 (Sat.) 2:00 P.M.', 'Computer Basics Workshop — Computer Lab (registration required)'],
            ['Oct. 19 (Sat.) 2:00 P.M.', 'Job Interview Skills Workshop — Computer Lab (registration required)'],
            ['Oct. 26 (Sat.) 11:00 A.M.', 'Used Book Sale — Lobby']
          ],
          notes: ['To register, call 555-0192.']
        },
        keys: [
          [['October nine', 'October ninth', 'October 9th', 'Wednesday'], ['Main Hall']],
          [['free']],
          [['computer basics'], ['job interview', 'interview'], ['computer lab']]
        ],
        intro: 'Hi, I\'m calling about the library\'s events this month. I saw a poster, but I didn\'t write down the details.',
        questions: [
          'When is the author talk, and where will it be held?',
          'I heard that I need to pay to attend the events. Is that right?',
          'Could you tell me about the events that require registration?'
        ]
      },
      q11: { text: 'Do you agree or disagree with the following statement? "Because of the Internet, public libraries are less important today than they were in the past." Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-10',
      title: '자체 제작 모의고사 10회',
      q1: { text: 'Good morning, everyone, and thank you for joining today\'s leadership workshop. This morning, we\'ll discuss how to communicate clearly, give useful feedback, and solve problems as a team. After lunch, you\'ll work in small groups on real business cases. Please take a name tag, a notebook, and a copy of today\'s schedule from the table near the entrance. Let\'s get started.' },
      q2: { text: 'Every Saturday morning, the Hillside Farmers Market brings fresh, local food to the town square. You\'ll find seasonal fruit, organic vegetables, fresh bread, and homemade jam from more than forty local farms. Bring your own shopping bag, and enjoy free cooking demonstrations by local chefs. The market is open from seven a.m. until noon, rain or shine.' },
      q3: { image: P.workshop },
      q4: { image: P.produce },
      q5_7: {
        starters: ["The nearest grocery store is about five minutes from my home, and I usually walk there.", "I think the best time to go grocery shopping in my neighborhood is in the morning, because the store is not crowded.", "I think it is a good idea to buy groceries online, because it saves a lot of time."],
        context: 'Imagine that a friend is moving to your neighborhood. You are having a telephone conversation about grocery shopping.',
        questions: [
          'Where is the nearest grocery store from your home, and how do you get there?',
          'What time of day is best to go grocery shopping in your neighborhood?',
          'Do you think it is a good idea to buy groceries online? Why or why not?'
        ]
      },
      q8_10: {
        models: ["The workshop is being held at the Summit Business Center on the 3rd floor. Registration starts at 9 a.m., so you should arrive by 9.", "Actually, you don't need to bring lunch. Lunch is provided.", "Anna White is leading two sessions. First, from 9:30 to 11 a.m., there is a session on clear communication at work. Second, from 1:30 to 3:30 p.m., there is a group project on solving business problems."],
        info: {
          title: 'Leadership Workshop',
          subtitle: 'Thursday, May 16  |  Summit Business Center, 3rd Floor',
          rows: [
            ['9:00 – 9:30 A.M.', 'Registration & Coffee'],
            ['9:30 – 11:00 A.M.', 'Clear Communication at Work — Anna White'],
            ['11:15 A.M. – 12:30 P.M.', 'Giving Useful Feedback — Mark Evans'],
            ['12:30 – 1:30 P.M.', 'Lunch (provided)'],
            ['1:30 – 3:30 P.M.', 'Group Project: Solving Business Problems — Anna White'],
            ['3:30 – 4:00 P.M.', 'Closing Remarks — Mark Evans']
          ],
          notes: ['Fee: $150 per person (group discount for 5 or more people)']
        },
        keys: [
          [['Summit'], ['nine']],
          [['provided', 'provide', 'included', 'don\'t need', 'do not need']],
          [['communication'], ['group project', 'business problems'], ['nine thirty'], ['one thirty']]
        ],
        intro: 'Hello, this is Daniel. My manager signed me up for the leadership workshop, but I didn\'t receive the schedule. Can you help me?',
        questions: [
          'Where is the workshop being held, and what time should I arrive?',
          'I\'ll need to bring my own lunch, right?',
          'Could you tell me about the sessions that Anna White is leading?'
        ]
      },
      q11: { text: 'Which do you think is a better way to learn new skills at work: attending workshops or learning from experienced coworkers? Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-11',
      title: '자체 제작 모의고사 11회',
      q1: { text: 'Good morning, passengers, and welcome aboard Coastline Express train number two-oh-five to Bayport. This train will stop at Milton, Greenwood, and Harbor Point before arriving at Bayport at ten fifteen. Food and drinks are available in car number four. Please keep your bags off the seats, and remember to take all of your belongings with you when you leave the train.' },
      q2: { text: 'Are you tired of waiting in long lines at the bank? With the new Clearpoint mobile app, you can check your balance, pay your bills, and send money to friends in just a few seconds. The app is free, simple to use, and protected by the latest security technology. Download it today, and manage your money anytime, anywhere.' },
      q3: { image: P.passportcontrol },
      q4: { image: P.whiteboard },
      q5_7: {
        starters: ["I go to a coffee shop about three times a week, and I usually go with my coworkers.", "I usually take my drink to go, because I don't have much time in the morning.", "The most important thing to me when choosing a coffee shop is a quiet place to sit, because I often study there."],
        context: 'Imagine that a US marketing firm is doing research in your country. You have agreed to participate in a telephone interview about coffee shops.',
        questions: [
          'How often do you go to a coffee shop, and who do you usually go with?',
          'When you go to a coffee shop, do you usually stay there or take your drink to go? Why?',
          'What is the most important thing to you when choosing a coffee shop? Why?'
        ]
      },
      q8_10: {
        models: ["The team meeting is on Monday, June 3, at 9 a.m., and it will be in Room 401.", "Actually, the budget review was moved to Wednesday, June 5, at 10 a.m.", "You have two interviews on Thursday, June 6. First, at 11 a.m., you will interview a candidate for the graphic designer position. Then, at 3 p.m., you will interview a candidate for the sales assistant position."],
        info: {
          title: 'Brookfield Marketing — Weekly Schedule',
          subtitle: 'Manager: Susan Clark  |  Week of June 3',
          rows: [
            ['Mon, June 3', '9:00 A.M.', 'Team Meeting (Room 401)'],
            ['Tue, June 4', '2:00 P.M.', 'Client Call: Rivera Foods'],
            ['Wed, June 5', '10:00 A.M.', 'Budget Review with Finance'],
            ['Thu, June 6', '11:00 A.M.', 'Interview: Graphic Designer Candidate'],
            ['Thu, June 6', '3:00 P.M.', 'Interview: Sales Assistant Candidate'],
            ['Fri, June 7', 'All day', 'Out of office (Trade Show, Chicago)']
          ],
          notes: ['The budget review was moved from Tuesday to Wednesday.']
        },
        keys: [
          [['monday'], ['nine'], ['four oh one', 'four zero one', '401', 'room four']],
          [['wednesday'], ['moved', 'changed', 'not tuesday']],
          [['graphic designer', 'designer'], ['sales assistant'], ['eleven'], ['three']]
        ],
        intro: 'Hi, this is Susan Clark. I\'m on my way to a meeting and I don\'t have my schedule with me. Could you answer a few questions?',
        questions: [
          'When is the team meeting this week, and where will it be?',
          'I think the budget review is on Tuesday. Is that right?',
          'Could you tell me the details of the interviews I have this week?'
        ]
      },
      q11: { text: 'Do you agree or disagree with the following statement? "Companies should allow employees to choose their own working hours." Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-12',
      title: '자체 제작 모의고사 12회',
      q1: { text: 'Thank you for joining us for tonight\'s performance at the Lakeside Theater. Before the show begins, please turn off your mobile phones and other electronic devices. Taking photos, making videos, and recording sound are not allowed during the performance. There will be a fifteen-minute break after the first act. Snacks and drinks can be purchased in the main lobby.' },
      q2: { text: 'In local news, the city of Westbrook has announced plans to build a new public swimming pool, a children\'s playground, and a walking trail along the river. Construction will begin next spring and is expected to take about eighteen months. City officials say the project will create jobs, attract visitors, and give residents more places to exercise.' },
      q3: { image: P.lecturehall },
      q4: { image: P.sidewalkdining },
      q5_7: {
        starters: ["I use my mobile phone about four hours a day, and I mostly use it for watching videos and sending messages.", "The last time I bought a new phone was about a year ago. I bought it at an electronics store.", "If I were buying a new phone, I would buy it in a store, because I want to try it before I buy it."],
        context: 'Imagine that a Canadian marketing firm is doing research in your country. You have agreed to participate in a telephone interview about mobile phones.',
        questions: [
          'How many hours a day do you use your mobile phone, and what do you mostly use it for?',
          'When was the last time you bought a new phone, and where did you buy it?',
          'If you were buying a new phone, would you buy it online or in a store? Why?'
        ]
      },
      q8_10: {
        models: ["The fall semester starts on September 9 and ends on December 13.", "Actually, there is one weekend class. Website Design is offered on Saturdays from 10 a.m. to 1 p.m. in the Computer Lab, and it costs 300 dollars.", "There are two classes on Mondays and Wednesdays. First, Basic Accounting is from 6 to 7:30 p.m. in Room 110, and it costs 220 dollars. Second, Business Writing is from 7:45 to 9:15 p.m. in Room 205, and it costs 180 dollars."],
        info: {
          title: 'Greenville Community College — Evening Classes',
          subtitle: 'Fall Semester  |  September 9 – December 13',
          rows: [
            ['Mon & Wed', '6:00 – 7:30 P.M.', 'Basic Accounting', 'Room 110', '$220'],
            ['Mon & Wed', '7:45 – 9:15 P.M.', 'Business Writing', 'Room 205', '$180'],
            ['Tue & Thu', '6:00 – 7:30 P.M.', 'Introduction to Photography', 'Art Studio', '$250'],
            ['Tue & Thu', '7:45 – 9:15 P.M.', 'Spanish for Beginners', 'Room 312', '$180'],
            ['Saturday', '10:00 A.M. – 1:00 P.M.', 'Website Design', 'Computer Lab', '$300']
          ],
          notes: ['Register by September 2 and receive 10% off.']
        },
        keys: [
          [['september nine', 'ninth'], ['december thirteen', 'thirteenth']],
          [['saturday'], ['not', 'only', 'actually'], ['website design']],
          [['accounting'], ['business writing'], ['six'], ['seven forty five', 'seven forty-five']]
        ],
        intro: 'Hello, my name is Rachel. I\'m interested in taking an evening class this fall, and I have a few questions.',
        questions: [
          'When does the fall semester start and end?',
          'I work on weekdays, so I can only come on weekends. I heard there are no weekend classes. Is that right?',
          'What classes are offered on Mondays and Wednesdays?'
        ]
      },
      q11: { text: 'Some people think that it is better to live in a big city. Others think that it is better to live in a small town. Which do you prefer, and why? Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-13',
      title: '자체 제작 모의고사 13회',
      q1: { text: 'Are you ready for the new school year? Head over to Parker\'s Office Supply for our back-to-school sale. This week only, notebooks, backpacks, and calculators are thirty percent off. Customers who spend more than fifty dollars will also receive a free pencil case. Visit one of our three downtown locations, or shop online at any time.' },
      q2: { text: 'Good afternoon, everyone, and thank you for attending this training session. Today, we will learn how to use our new customer database. First, I will show you how to search for customer records. Then, we will practice updating contact information, adding notes, and creating reports. Please ask questions at any time, and don\'t forget to save your work.' },
      q3: { image: P.bookstore },
      q4: { image: P.foodprep },
      q5_7: {
        starters: ["The last time I watched a movie was last weekend. It was about a family who traveled around the world.", "I prefer to watch movies at home, because I can watch them comfortably at any time.", "If a new movie theater opened in my area, I would go there if it had comfortable seats, because I like to relax when I watch a movie."],
        context: 'Imagine that you are talking on the telephone with a friend. You are talking about watching movies.',
        questions: [
          'When was the last time you watched a movie, and what was it about?',
          'Do you prefer to watch movies at home or at a movie theater? Why?',
          'If a new movie theater opened in your area, what would make you want to go there? Why?'
        ]
      },
      q8_10: {
        models: ["The tour starts at City Hall, and the bus leaves at 8 a.m.", "Actually, that's not correct. Only the hotel and breakfast are included in the price. Lunch and dinner are not included.", "On the second day, there are two activities. First, at 9 a.m., we will visit the Mountain History Museum. Then, at 2 p.m., we will take a cable car ride to the summit."],
        info: {
          title: 'Sunrise Travel — Tour Itinerary',
          subtitle: 'Three-Day Mountain Tour  |  Group Leader: Kevin Park',
          rows: [
            ['Day 1', '8:00 A.M.', 'Depart from City Hall by bus'],
            ['Day 1', '1:00 P.M.', 'Lunch at Pine Valley Restaurant'],
            ['Day 1', '3:00 P.M.', 'Hike to Silver Lake (2 hours)'],
            ['Day 2', '9:00 A.M.', 'Visit Mountain History Museum'],
            ['Day 2', '2:00 P.M.', 'Cable car ride to the summit'],
            ['Day 3', '10:00 A.M.', 'Free time in Maple Village'],
            ['Day 3', '4:00 P.M.', 'Return to City Hall']
          ],
          notes: ['Price: $450 per person (hotel and breakfast included)', 'Lunch and dinner are not included.']
        },
        keys: [
          [['city hall'], ['eight']],
          [['not included', 'not', 'actually', 'only breakfast', 'pay'], ['breakfast']],
          [['museum'], ['cable car', 'summit'], ['nine'], ['two']]
        ],
        intro: 'Hi, this is Linda. I signed up for the mountain tour, but I have a few questions about the schedule.',
        questions: [
          'Where does the tour start, and what time do we leave?',
          'I heard all meals are included in the price. Is that right?',
          'What are we going to do on the second day?'
        ]
      },
      q11: { text: 'Do you agree or disagree with the following statement? "It is better to save money for the future than to spend it on things you enjoy now." Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-14',
      title: '자체 제작 모의고사 14회',
      q1: { text: 'Attention, all employees. Our building will be closed this Saturday for electrical repairs. Power will be turned off from seven a.m. until five p.m. Before you leave on Friday, please shut down your computers, unplug any personal devices, and remove food from the kitchen refrigerator. If you have any questions, please contact the facilities team at extension four-five-two.' },
      q2: { text: 'Welcome to the Harrison Art Museum. Our main gallery features paintings, sculptures, and photographs from more than forty local artists. Audio guides are available at the information desk in English, Spanish, and Japanese. Free guided tours begin every hour on the hour. Please do not touch the artwork, and enjoy your visit.' },
      q3: { image: P.conventioncenter },
      q4: { image: P.autorepair },
      q5_7: {
        starters: ["I exercise about three times a week, and I usually go jogging in the park.", "I prefer to exercise with other people, because it helps me stay motivated.", "If a new fitness center opened near my home, I would join it if the membership fee were reasonable, because I am trying to save money."],
        context: 'Imagine that a British marketing firm is doing research in your country. You have agreed to participate in a telephone interview about exercise.',
        questions: [
          'How often do you exercise, and what kind of exercise do you do?',
          'Do you prefer to exercise alone or with other people? Why?',
          'If a new fitness center opened near your home, what would make you join it? Why?'
        ]
      },
      q8_10: {
        models: ["The job fair is being held in Hall B of the Hartley Convention Center, and it begins at 10 a.m.", "I'm afraid that's not correct. Online registration is required, so please register before you come.", "In the afternoon, there are two events. First, from 1:30 to 4 p.m., there are one-on-one interviews in Rooms 1 to 5. After that, from 4 to 4:30 p.m., there is a company tour."],
        info: {
          title: 'Hartley Industries — Job Fair',
          subtitle: 'Saturday, April 12  |  Hartley Convention Center, Hall B',
          rows: [
            ['10:00 – 10:30 A.M.', 'Welcome Speech — Paul Hartley, President'],
            ['10:30 – 11:30 A.M.', 'Information Session: Engineering Positions'],
            ['11:30 A.M. – 12:30 P.M.', 'Information Session: Sales and Marketing Positions'],
            ['12:30 – 1:30 P.M.', 'Lunch Break'],
            ['1:30 – 4:00 P.M.', 'One-on-One Interviews (Rooms 1–5)'],
            ['4:00 – 4:30 P.M.', 'Company Tour']
          ],
          notes: ['Please bring five copies of your résumé.', 'Online registration is required.']
        },
        keys: [
          [['convention center', 'hall b'], ['ten']],
          [['registration', 'register', 'required', 'not', 'actually', 'online']],
          [['interview', 'interviews'], ['one thirty'], ['company tour', 'tour'], ['four']]
        ],
        intro: 'Hello, my name is Jennifer. I\'m planning to go to the Hartley job fair, and I\'d like to check a few details.',
        questions: [
          'Where is the job fair being held, and what time does it begin?',
          'I don\'t need to register in advance, right? I can just show up.',
          'What is scheduled for the afternoon?'
        ]
      },
      q11: { text: 'Some people think that managers should make all the important decisions. Others think that team members should make decisions together. Which do you agree with, and why? Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-15',
      title: '자체 제작 모의고사 15회',
      q1: { text: 'This is Tom Bradley with your morning traffic report. Traffic is moving slowly on Highway Nine because of road construction near the airport. If you are driving downtown, you may want to take Oak Street, Lincoln Avenue, or the river road instead. Buses and trains are running on schedule. Our next update will be in thirty minutes.' },
      q2: { text: 'Thank you for shopping at Home Plus Furniture. We are pleased to offer free delivery on all orders over five hundred dollars. Our delivery team will bring your new sofa, table, or bed directly into your home and set it up for you. To schedule a delivery time, please visit the service counter near the main entrance.' },
      q3: { image: P.breadstall },
      q4: { image: P.studygroup },
      q5_7: {
        starters: ["I shop online about twice a week, and I usually buy clothes and household items.", "The last thing I bought online was a pair of running shoes, and I was very happy with them.", "I don't think online shopping will completely replace shopping in stores, because many people still want to see and touch products before buying them."],
        context: 'Imagine that an Australian marketing firm is doing research in your country. You have agreed to participate in a telephone interview about online shopping.',
        questions: [
          'How often do you shop online, and what do you usually buy?',
          'What was the last thing you bought online, and were you happy with it?',
          'Do you think online shopping will completely replace shopping in stores in the future? Why or why not?'
        ]
      },
      q8_10: {
        models: ["Dr. Hill works on Tuesdays and Thursdays, from 10 a.m. to 6 p.m.", "Actually, parking is free for patients, so you don't have to pay.", "Dr. Chen is available three days this week: Monday, Wednesday, and Friday. On those days, Dr. Chen sees patients from 9 a.m. to 5 p.m."],
        info: {
          title: 'Ridgeway Medical Center — Doctor Schedule',
          subtitle: 'Week of March 10',
          rows: [
            ['Dr. Emily Chen', 'Family Medicine', 'Mon, Wed, Fri', '9:00 A.M. – 5:00 P.M.'],
            ['Dr. Robert Hill', 'Skin Care', 'Tue, Thu', '10:00 A.M. – 6:00 P.M.'],
            ['Dr. Maria Lopez', 'Children\'s Health', 'Mon – Fri', '8:00 A.M. – 2:00 P.M.'],
            ['Dr. James Kim', 'Eye Care', 'Saturday', '9:00 A.M. – 1:00 P.M.']
          ],
          notes: ['Appointments can be made by phone or on our website.', 'Parking is free for patients.']
        },
        keys: [
          [['tuesday'], ['thursday'], ['ten'], ['six']],
          [['not', 'actually', 'free'], ['free', 'no charge', 'don\'t need to pay', 'do not need to pay']],
          [['monday'], ['wednesday'], ['friday'], ['nine'], ['five']]
        ],
        intro: 'Hi, I\'d like to make an appointment at the medical center, but I need some information first.',
        questions: [
          'I need to see Dr. Hill. Which days does he work, and what are his hours?',
          'I heard that patients have to pay for parking. Is that right?',
          'Could you tell me when Dr. Chen is available this week?'
        ]
      },
      q11: { text: 'Do you agree or disagree with the following statement? "Employees should take a vacation of at least two weeks every year." Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-16',
      title: '자체 제작 모의고사 16회',
      q1: { text: 'Welcome to Sunnyside Garden Center. This month, we are celebrating our tenth anniversary with special events for the whole family. Every Saturday, our experts will give free lessons on planting flowers, growing vegetables, and caring for indoor plants. Members receive an extra ten percent off all purchases. Ask any cashier how to become a member today.' },
      q2: { text: 'Hello, and thank you for calling Fast Fix Computer Repair. We repair laptops, desktop computers, tablets, and printers. Most repairs are completed within two business days. If you would like to check the status of your repair, please press one. To speak with a technician, press two. For our store hours and location, press three.' },
      q3: { image: P.siteplan },
      q4: { image: P.parklawn },
      q5_7: {
        starters: ["A popular place for tourists in my city is the old palace downtown, and most people get there by subway.", "The best time of year to visit my city is fall, because the weather is cool and the leaves are beautiful.", "If you only have one day in my city, you should visit the traditional market, because you can try many local foods there."],
        context: 'Imagine that a friend is visiting your city next month. You are having a telephone conversation about tourist attractions.',
        questions: [
          'What is a popular place for tourists to visit in your city, and how do people get there?',
          'What is the best time of year to visit your city? Why?',
          'If I only have one day in your city, what should I do? Why?'
        ]
      },
      q8_10: {
        models: ["Admission is 40 dollars if you buy a ticket in advance, and 55 dollars at the door.", "Actually, the first event is the opening speech on healthy eating trends by Dr. Alan Brooks at 9 a.m. The cooking demonstration starts at 11:30 a.m.", "Sarah Miller is giving two lectures. First, from 10:15 to 11:15 a.m., the lecture is about reducing food waste. Second, from 1:30 to 2:30 p.m., the lecture is about packaging for the future."],
        info: {
          title: 'National Food Industry Expo',
          subtitle: 'Thursday, August 22  |  Metro Exhibition Hall',
          rows: [
            ['9:00 – 10:00 A.M.', 'Opening Speech: Healthy Eating Trends — Dr. Alan Brooks'],
            ['10:15 – 11:15 A.M.', 'Lecture: Reducing Food Waste — Sarah Miller'],
            ['11:30 A.M. – 12:30 P.M.', 'Cooking Demonstration: Plant-Based Meals — Chef Tony Russo'],
            ['12:30 – 1:30 P.M.', 'Lunch (Food Court)'],
            ['1:30 – 2:30 P.M.', 'Lecture: Packaging for the Future — Sarah Miller'],
            ['2:45 – 4:00 P.M.', 'Panel Discussion: Starting a Food Business']
          ],
          notes: ['Admission: $40 in advance, $55 at the door']
        },
        keys: [
          [['forty'], ['fifty five', 'fifty-five']],
          [['nine'], ['opening', 'healthy eating', 'alan brooks'], ['not', 'actually']],
          [['food waste'], ['packaging'], ['ten fifteen'], ['one thirty']]
        ],
        intro: 'Hello, this is Michael from Green Farms. I\'m going to the food industry expo, and I have some questions.',
        questions: [
          'How much is admission to the expo?',
          'The cooking demonstration is the first event of the day, right?',
          'Could you tell me about the lectures that Sarah Miller is giving?'
        ]
      },
      q11: { text: 'Some people prefer to work for a large company. Others prefer to work for a small company. Which do you prefer, and why? Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-17',
      title: '자체 제작 모의고사 17회',
      q1: { text: 'Thank you for flying with Blue Sky Airlines. In a few minutes, we will begin boarding flight seven-two-one to Vancouver. Passengers traveling with small children, passengers who need extra help, and business class passengers may board first. Please have your boarding pass and passport ready. We expect to arrive in Vancouver on time.' },
      q2: { text: 'Do you want to speak a foreign language with confidence? At Global Language Academy, our experienced teachers make learning fun and easy. We offer small group classes, private lessons, and online courses for all levels. Classes are available in the morning, afternoon, and evening. Sign up this month, and your first lesson is free.' },
      q3: { image: P.trainplatform },
      q4: { image: P.butchercounter },
      q5_7: {
        starters: ["I listen to music every day, and I usually listen to it on the subway.", "Yes, I have been to a concert. I went to a rock concert last year, because my favorite band was performing.", "I prefer to listen to music on my phone, because I can choose the songs I like."],
        context: 'Imagine that a US marketing firm is doing research in your country. You have agreed to participate in a telephone interview about music.',
        questions: [
          'How often do you listen to music, and where do you usually listen to it?',
          'Have you ever been to a concert? Why or why not?',
          'Do you prefer to listen to music on your phone or on the radio? Why?'
        ]
      },
      q8_10: {
        models: ["The restaurant is on the first floor, and breakfast is served from 6:30 to 10 a.m.", "I'm sorry, but the pool is closed on Mondays. It's open from 8 a.m. to 8 p.m. on other days.", "The airport shuttle runs every hour from 5 a.m. to 9 p.m., and it costs 15 dollars per person."],
        info: {
          title: 'Bright Star Hotel — Guest Services',
          subtitle: 'Front Desk: open 24 hours',
          rows: [
            ['Restaurant (1st Floor)', 'Breakfast 6:30 – 10:00 A.M.', 'Dinner 5:30 – 10:00 P.M.'],
            ['Fitness Center (3rd Floor)', '6:00 A.M. – 11:00 P.M.', 'Free for guests'],
            ['Swimming Pool (Rooftop)', '8:00 A.M. – 8:00 P.M.', 'Closed on Mondays'],
            ['Business Center (2nd Floor)', '7:00 A.M. – 9:00 P.M.', 'Printing: $0.20 per page'],
            ['Airport Shuttle', 'Every hour, 5:00 A.M. – 9:00 P.M.', '$15 per person']
          ],
          notes: ['Check-out time is 11:00 A.M.']
        },
        keys: [
          [['first floor', '1st floor', 'one'], ['six thirty'], ['ten']],
          [['closed', 'not', 'actually'], ['monday']],
          [['every hour', 'each hour', 'hourly'], ['fifteen'], ['five'], ['nine']]
        ],
        intro: 'Hi, I\'m staying in room 508, and I have a few questions about the hotel services.',
        questions: [
          'Where is the restaurant, and what time is breakfast served?',
          'I\'d like to go swimming tomorrow morning. Tomorrow is Monday, so the pool is open, right?',
          'Could you tell me about the airport shuttle?'
        ]
      },
      q11: { text: 'Do you agree or disagree with the following statement? "Students should be required to do volunteer work in their community." Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-18',
      title: '자체 제작 모의고사 18회',
      q1: { text: 'Good evening, and welcome to the annual Employee Awards Dinner. Tonight, we will recognize team members who have shown excellent leadership, creativity, and teamwork over the past year. Dinner will be served shortly, followed by a short speech from our president. After that, we will announce this year\'s award winners. Please enjoy your meal.' },
      q2: { text: 'Are you planning a wedding, a birthday party, or a business event? Let Lily\'s Catering take care of the food. We offer fresh salads, hot dishes, and delicious desserts for groups of ten to five hundred people. Our friendly staff will set up, serve, and clean up, so you can relax and enjoy your event. Call today for a free price quote.' },
      q3: { image: P.officelounge },
      q4: { image: P.cyclists },
      q5_7: {
        starters: ["I read books about twice a month, and I like mystery novels.", "I usually get the books that I read from the library near my home.", "I prefer to read paper books, because I can concentrate better and my eyes don't get tired."],
        context: 'Imagine that a Canadian marketing firm is doing research in your country. You have agreed to participate in a telephone interview about reading.',
        questions: [
          'How often do you read books, and what kind of books do you like?',
          'Where do you usually get the books that you read?',
          'Do you prefer to read paper books or electronic books? Why?'
        ]
      },
      q8_10: {
        models: ["The bus leaves from the main office at 8 a.m. on Friday.", "Actually, that's not correct. Rooms are shared by two employees.", "Helen Ward is leading two workshops. First, on Friday at 3 p.m., there is a workshop on time management. Second, on Saturday at 9 a.m., there is a workshop on working with difficult clients."],
        info: {
          title: 'Bell & Ross Accounting — Annual Company Retreat',
          subtitle: 'Friday, October 4 – Saturday, October 5  |  Pine Lake Resort',
          rows: [
            ['Fri', '8:00 A.M.', 'Bus leaves from main office'],
            ['Fri', '11:00 A.M.', 'Team-building games (Lakeside Field)'],
            ['Fri', '1:00 P.M.', 'Lunch (Lakeview Restaurant)'],
            ['Fri', '3:00 P.M.', 'Workshop: Time Management — Helen Ward'],
            ['Fri', '7:00 P.M.', 'Dinner and awards'],
            ['Sat', '9:00 A.M.', 'Workshop: Working with Difficult Clients — Helen Ward'],
            ['Sat', '12:00 P.M.', 'Bus returns to main office']
          ],
          notes: ['Rooms are shared by two employees.']
        },
        keys: [
          [['main office'], ['eight']],
          [['not', 'actually', 'shared', 'share'], ['two', 'another', 'roommate']],
          [['time management'], ['difficult clients'], ['three'], ['nine']]
        ],
        intro: 'Hi, this is Brian from the sales team. I\'m going to the company retreat next month, but I missed the planning meeting.',
        questions: [
          'Where and when does the bus leave on Friday?',
          'I heard that each employee will have a private room. Is that right?',
          'What workshops is Helen Ward leading?'
        ]
      },
      q11: { text: 'Some people think that it is important to have a job that pays a high salary. Others think that it is more important to have a job that they enjoy. Which do you agree with, and why? Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-19',
      title: '자체 제작 모의고사 19회',
      q1: { text: 'Thank you for visiting the City Science Center. Today, we are opening a new exhibit about space travel, ocean life, and the human body. Visitors can watch short films, try hands-on activities, and talk with our science guides. The exhibit is located on the second floor. Please remember that eating and drinking are not allowed inside the exhibit halls.' },
      q2: { text: 'Here is the weather forecast for the weekend. Saturday will be cloudy and cool, with a high of fifteen degrees. Heavy rain is expected on Saturday night, so be sure to bring an umbrella if you are going out. On Sunday, the rain will stop by noon, and the afternoon will be sunny, warm, and pleasant. It should be a great day for outdoor activities.' },
      q3: { image: P.harborview },
      q4: { image: P.carpentry },
      q5_7: {
        starters: ["I cook at home about four times a week, and I usually make simple dishes like fried rice or soup.", "My mother taught me how to cook when I was in high school.", "I think it is better to cook at home, because it is healthier and cheaper than eating at restaurants."],
        context: 'Imagine that a British marketing firm is doing research in your country. You have agreed to participate in a telephone interview about cooking at home.',
        questions: [
          'How often do you cook at home, and what do you usually make?',
          'Who taught you how to cook, and when did you learn?',
          'Do you think it is better to cook at home or to eat at restaurants? Why?'
        ]
      },
      q8_10: {
        models: ["The first event is on May 6 at the Page One Bookstore in Boston, at 6 p.m. It's a reading and book signing.", "Actually, not all of them. All of the events are free except the business lunch in Baltimore on May 15, which costs 35 dollars.", "There are two lectures. First, on May 8, there is a lecture at the Central Library in New York at 7 p.m. Second, on May 10, there is a lecture at City University in Philadelphia at 2 p.m."],
        info: {
          title: 'Dr. Nancy Ford — Book Tour',
          subtitle: 'New Book: "Small Habits, Big Results"',
          rows: [
            ['May 6', 'Boston', 'Page One Bookstore', '6:00 P.M.', 'Reading & Book Signing'],
            ['May 8', 'New York', 'Central Library', '7:00 P.M.', 'Lecture'],
            ['May 10', 'Philadelphia', 'City University', '2:00 P.M.', 'Lecture'],
            ['May 13', 'Washington', 'Main Street Books', '6:30 P.M.', 'Reading & Book Signing'],
            ['May 15', 'Baltimore', 'Harbor Hotel', '12:00 P.M.', 'Business Lunch ($35)']
          ],
          notes: ['All events are free except the business lunch.']
        },
        keys: [
          [['boston'], ['may six', 'sixth'], ['page one']],
          [['not', 'actually', 'only', 'except'], ['lunch', 'baltimore'], ['thirty five', 'thirty-five']],
          [['new york'], ['philadelphia'], ['library'], ['city university', 'university']]
        ],
        intro: 'Hi, I\'m a big fan of Dr. Ford, and I\'d like to attend one of her events. Can you give me some information?',
        questions: [
          'Where and when is the first event of the tour?',
          'I heard that all of the events are free. Is that right?',
          'Could you give me the details of the lectures she is giving?'
        ]
      },
      q11: { text: 'Do you agree or disagree with the following statement? "It is better to learn a new skill by taking a class than by studying alone." Use specific reasons and examples to support your opinion.' }
    },
    {
      id: 'builtin-20',
      title: '자체 제작 모의고사 20회',
      q1: { text: 'Attention, shoppers. The Westgate Shopping Mall will be closing in thirty minutes. Please bring your final purchases to the nearest cashier. If you parked in the underground garage, please note that the east exit is closed for repairs. Please use the north or south exit instead. Thank you for shopping with us, and we hope to see you again soon.' },
      q2: { text: 'Welcome to the Green Valley Recycling Center. To help us work quickly, please separate your paper, plastic, and glass before you arrive. Large items, such as old furniture and electronics, can be dropped off on Tuesdays and Saturdays only. Our staff will be happy to answer any questions. Thank you for helping to keep our community clean.' },
      q3: { image: P.streetfoodstall },
      q4: { image: P.strawberrypicking },
      q5_7: {
        starters: ["I take photos almost every day, and I usually take photos of food and nature.", "Yes, I usually share my photos with my friends on social media, because I want to share my daily life with them.", "I would rather take photos with a phone, because it is light and I always carry it with me."],
        context: 'Imagine that an Australian marketing firm is doing research in your country. You have agreed to participate in a telephone interview about taking photos.',
        questions: [
          'How often do you take photos, and what do you usually take photos of?',
          'Do you usually share your photos with other people? Why or why not?',
          'Would you rather take photos with a phone or with a camera? Why?'
        ]
      },
      q8_10: {
        models: ["The interviews will take place in Room 204, and the first one is at 9 a.m.", "I'm sorry, but that interview has been cancelled. Diana Ross will not be coming at 11.", "Two candidates are currently working as office managers. First, Steven Lee, who works at Bay Bank, has an interview at 10 a.m. Second, Amy Hall from Star Media has an interview at 2:30 p.m. Diana Ross is also an office manager, but that interview was cancelled."],
        info: {
          title: 'Taylor & Associates — Job Interview Schedule',
          subtitle: 'Position: Office Manager  |  Wednesday, February 12  |  Room 204',
          rows: [
            ['9:00 A.M.', 'Karen Wright', 'Current job: Office Assistant, Lee Law Firm'],
            ['10:00 A.M.', 'Steven Lee', 'Current job: Office Manager, Bay Bank'],
            ['11:00 A.M.', 'Diana Ross', 'Current job: Office Manager, City Hospital (cancelled)'],
            ['1:30 P.M.', 'Ryan Scott', 'Current job: Administrative Assistant, Sun Hotel'],
            ['2:30 P.M.', 'Amy Hall', 'Current job: Office Manager, Star Media']
          ],
          notes: ['Interviews will be conducted by the HR director and the operations manager.']
        },
        keys: [
          [['room two oh four', 'two oh four', 'two zero four', '204', 'room two'], ['nine']],
          [['cancelled', 'canceled', 'not', 'actually'], ['diana']],
          [['steven'], ['amy'], ['bay bank'], ['star media']]
        ],
        intro: 'Hi, this is Peter from the operations team. I\'ll be helping with tomorrow\'s interviews for the office manager position. Could you answer a few questions?',
        questions: [
          'Where will the interviews take place, and what time is the first one?',
          'I\'m looking forward to meeting Diana Ross at eleven. That interview is still scheduled, right?',
          'Could you tell me about the candidates who are currently working as office managers?'
        ]
      },
      q11: { text: 'Which is more important for success at work: good communication skills or strong technical knowledge? Use specific reasons and examples to support your opinion.' }
    }
  ];
})();
