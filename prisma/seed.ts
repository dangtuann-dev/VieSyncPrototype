import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('kai1412666', 12)
  await prisma.user.upsert({
    where: { email: 'kairenku@gmail.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'kairenku@gmail.com',
      password: hashedPassword,
      isAdmin: true,
      onboarded: true,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin seeded: kairenku@gmail.com / kai1412666')

  // Seed courses and lessons
  const courses = [
    {
      slug: 'management-101',
      title: 'Nhập Môn Quản Trị Doanh Nghiệp Hiện Đại',
      description: 'Khóa học dành cho người mới bắt đầu tìm hiểu về quản trị doanh nghiệp, kỹ năng ra quyết định và quản lý đội nhóm.',
      field: 'management',
      level: 'beginner',
      tags: ['Quản trị', 'Doanh nghiệp', 'Lãnh đạo'],
      zaloLink: 'https://zalo.me/g/placeholder',
      lessons: [
        {
          order: 1,
          title: 'Quản Trị Là Gì & Tại Sao Quan Trọng?',
          youtubeVideoId: '1a_2b3c4d5e', // Placeholder ID
          duration: 12,
          transcript: 'Tổng quan về quản trị.\nTầm quan trọng của quản trị doanh nghiệp.\nCác kỹ năng cần thiết của nhà quản lý.'
        },
        {
          order: 2,
          title: 'Kỹ Năng Ra Quyết Định Trong Quản Trị',
          youtubeVideoId: '2b_3c4d5e6f',
          duration: 13,
          transcript: 'Các bước ra quyết định.\nPhân tích rủi ro.\nCase study thực tế.'
        },
        {
          order: 3,
          title: 'Xây Dựng & Quản Lý Đội Nhóm',
          youtubeVideoId: '3c_4d5e6f7g',
          duration: 11,
          transcript: 'Cách xây dựng team.\nĐộng viên nhân viên.\nGiải quyết xung đột nội bộ.'
        }
      ]
    },
    {
      slug: 'softskills-communication',
      title: 'Kỹ Năng Giao Tiếp & Thuyết Trình Chuyên Nghiệp',
      description: 'Cải thiện khả năng giao tiếp, lắng nghe chủ động và xây dựng bài thuyết trình thuyết phục.',
      field: 'softskills',
      level: 'beginner',
      tags: ['Giao tiếp', 'Thuyết trình', 'Kỹ năng mềm'],
      zaloLink: 'https://zalo.me/g/placeholder',
      lessons: [
        {
          order: 1,
          title: 'Nghệ Thuật Lắng Nghe Chủ Động',
          youtubeVideoId: '4d_5e6f7g8h',
          duration: 10,
          transcript: 'Lắng nghe chủ động là gì?\nCác rào cản khi lắng nghe.\nKỹ thuật phản hồi.'
        },
        {
          order: 2,
          title: 'Cấu Trúc Bài Thuyết Trình Thuyết Phục',
          youtubeVideoId: '5e_6f7g8h9i',
          duration: 14,
          transcript: 'Chuẩn bị bài thuyết trình.\nCấu trúc 3 phần.\nNgôn ngữ cơ thể.'
        },
        {
          order: 3,
          title: 'Xử Lý Xung Đột & Phản Hồi Chuyên Nghiệp',
          youtubeVideoId: '6f_7g8h9i0j',
          duration: 12,
          transcript: 'Nhận diện xung đột.\nCác phương pháp xử lý.\nĐưa feedback xây dựng.'
        }
      ]
    },
    {
      slug: 'it-python-basics',
      title: 'Python Cơ Bản — Từ Số Không Đến Có Thể Code',
      description: 'Làm quen với tư duy lập trình và ngôn ngữ Python thông qua các ví dụ thực tế.',
      field: 'it',
      level: 'beginner',
      tags: ['Lập trình', 'Python', 'IT'],
      zaloLink: 'https://zalo.me/g/placeholder',
      lessons: [
        {
          order: 1,
          title: 'Tư Duy Lập Trình & Cài Đặt Môi Trường',
          youtubeVideoId: '7g_8h9i0j1k',
          duration: 12,
          transcript: 'Tư duy thuật toán.\nCài đặt Python.\nHello World.'
        },
        {
          order: 2,
          title: 'Biến, Kiểu Dữ Liệu & Vòng Lặp Đầu Tiên',
          youtubeVideoId: '8h_9i0j1k2l',
          duration: 15,
          transcript: 'Các kiểu dữ liệu cơ bản.\nToán tử.\nVòng lặp for và while.'
        },
        {
          order: 3,
          title: 'Hàm & Module — Sức Mạnh Tái Sử Dụng Code',
          youtubeVideoId: '9i_0j1k2l3m',
          duration: 13,
          transcript: 'Định nghĩa hàm.\nTham số và giá trị trả về.\nSử dụng thư viện.'
        }
      ]
    },
    {
      slug: 'marketing-digital-basics',
      title: 'Digital Marketing Từ A-Z Cho Người Mới',
      description: 'Nắm bắt các khái niệm cơ bản về marketing số, content marketing và đo lường hiệu quả.',
      field: 'marketing',
      level: 'beginner',
      tags: ['Marketing', 'Digital', 'Content'],
      zaloLink: 'https://zalo.me/g/placeholder',
      lessons: [
        {
          order: 1,
          title: 'Hiểu Khách Hàng — Nền Tảng Của Mọi Chiến Lược',
          youtubeVideoId: '0j_1k2l3m4n',
          duration: 11,
          transcript: 'Chân dung khách hàng.\nHành trình khách hàng.\nPhân khúc thị trường.'
        },
        {
          order: 2,
          title: 'Content Marketing & Kể Chuyện Thương Hiệu',
          youtubeVideoId: '1k_2l3m4n5o',
          duration: 13,
          transcript: 'Thế nào là content tốt?\nStorytelling.\nCác định dạng content phổ biến.'
        },
        {
          order: 3,
          title: 'Đo Lường & Tối Ưu Chiến Dịch Marketing',
          youtubeVideoId: '2l_3m4n5o6p',
          duration: 12,
          transcript: 'Các chỉ số quan trọng (KPIs).\nCông cụ đo lường.\nA/B Testing.'
        }
      ]
    }
  ]

  for (const courseData of courses) {
    const { lessons, ...course } = courseData
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {},
      create: {
        ...course,
        lessons: {
          create: lessons
        }
      }
    })
  }
  
  console.log('✅ Courses and lessons seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
