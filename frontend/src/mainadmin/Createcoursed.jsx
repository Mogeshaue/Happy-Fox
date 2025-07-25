import React, { useEffect, useState } from "react";
import useCourseStore from "../store/Adminstors";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Collapse,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import Loader from '../components/common/Loader';
import { useSnackbar } from 'notistack';

const Createcoursed = () => {
  const {
    courses,
    fetchCourses,
    deleteCourse,
    loadingCourses,
    errorCourses,
  } = useCourseStore();
  const [expandedCourses, setExpandedCourses] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line
  }, []);

  const toggleCourse = (courseId) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await deleteCourse(id);
    setDeletingId(null);
    enqueueSnackbar('Course deleted', { variant: 'info' });
  };

  if (loadingCourses) return <Loader />;

  return (
    <Box sx={{ p: { xs: 2, md: 6 } }}>
      <Typography variant="h4" fontWeight={700} mb={4} color="text.primary">
        Created Courses
      </Typography>
      {errorCourses ? (
        <Typography color="error">Error: {errorCourses}</Typography>
      ) : courses.length === 0 ? (
        <Typography color="text.secondary">No courses created yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} key={course.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6">{course.name}</Typography>
                    <Box>
                      <IconButton onClick={() => toggleCourse(course.id)} size="large">
                        {expandedCourses[course.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(course.id)}
                        color="error"
                        disabled={deletingId === course.id}
                        size="large"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  {course.description && (
                    <Typography color="text.secondary" mb={1}>{course.description}</Typography>
                  )}
                  <Collapse in={expandedCourses[course.id]}>
                    <Typography color="text.disabled" variant="body2">
                      (Modules feature coming soon)
                    </Typography>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Createcoursed;
